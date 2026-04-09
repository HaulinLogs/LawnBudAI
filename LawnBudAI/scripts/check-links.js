#!/usr/bin/env node

/**
 * External Link Checker
 *
 * Scans all TypeScript/JavaScript source files for external URLs embedded in
 * string literals and verifies each one returns a non-broken HTTP response.
 *
 * Exit codes:
 *   0 = All links valid (or only soft warnings)
 *   1 = One or more links confirmed broken (404 / 410 / connection error)
 *
 * Run: node scripts/check-links.js
 * CI:  yarn check:links
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Directories to skip entirely */
const SKIP_DIRS = new Set(['node_modules', '.yarn', '.expo', 'dist', 'build', '.git']);

/** File extensions to scan */
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

/** Skip test files — their URLs are fixtures, not real links */
const SKIP_PATH_PATTERNS = [/__tests__/, /\.test\./, /\.spec\./, /playwright\.config/];

/** URL patterns that are never real links */
const SKIP_URL_PATTERNS = [
  /^https?:\/\/localhost/,
  /^https?:\/\/127\./,
  /^https?:\/\/0\.0\.0\.0/,
  /^https?:\/\/example\.com/,
  /your-project\.supabase\.co/,
  /YOUR_PROJECT\.supabase\.co/,
  /test\.supabase\.co/,
  /\$\{/,                     // dynamic template literal segments
];

/** HTTP status codes that confirm a link is broken */
const BROKEN_STATUSES = new Set([404, 410]);

/** HTTP status codes treated as soft warnings (bot-blocking, not truly broken) */
const WARN_STATUSES = new Set([403, 429]);

const REQUEST_TIMEOUT_MS = 12000;
const CONCURRENCY = 4; // parallel fetch limit

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

function walkDir(dir, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkDir(fullPath, results);
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// URL extraction
// ---------------------------------------------------------------------------

/**
 * Extract URLs that appear inside string literals (single, double, or
 * template-literal quotes). Skips pure-comment lines to reduce noise.
 */
function extractUrlsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const urls = [];

  // Match URLs inside quoted strings only (not bare comments)
  // Captures the URL up to the closing quote or whitespace
  const pattern = /['"`](https?:\/\/[^'"`\s\\>)]+)['"`]/g;

  let match;
  while ((match = pattern.exec(content)) !== null) {
    const url = match[1].replace(/[.,;]$/, ''); // strip trailing punctuation
    if (!shouldSkip(url)) {
      urls.push(url);
    }
  }

  return urls;
}

function shouldSkip(url) {
  return SKIP_URL_PATTERNS.some(re => re.test(url));
}

// ---------------------------------------------------------------------------
// HTTP checking
// ---------------------------------------------------------------------------

/**
 * Full browser User-Agent used for 403-retry requests.
 *
 * Some university extension sites (e.g. extension.umn.edu) return 403 for
 * ALL bot requests, whether the page exists or not, making it impossible to
 * distinguish a live-but-blocked page from a deleted one.  Retrying with a
 * browser UA string resolves this for most of those servers: if the page
 * exists they return 200; if it doesn't they still return 403 or redirect to
 * a generic error page (different final URL).
 */
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const BOT_UA =
  'Mozilla/5.0 (compatible; LawnBudAI-LinkChecker/1.0; +https://github.com/HaulinLogs/lawnbudai)';

async function fetchWithTimeout(url, method, ua) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      headers: { 'User-Agent': ua },
      redirect: 'follow',
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function checkUrl(url) {
  try {
    // Step 1: HEAD with bot UA (fast path for well-behaved servers)
    let res = await fetchWithTimeout(url, 'HEAD', BOT_UA);

    // Step 2: Some servers reject HEAD → retry with GET
    if (res.status === 405) {
      res = await fetchWithTimeout(url, 'GET', BOT_UA);
    }

    // Step 3: If still 403, retry with a browser UA.
    //
    // Rationale: sites like extension.umn.edu return 403 to bots for BOTH
    // existing and deleted pages.  With a real browser UA they return 200 for
    // live pages and redirect/404 for missing ones, letting us tell the
    // difference.
    if (res.status === 403) {
      let retryRes;
      try {
        retryRes = await fetchWithTimeout(url, 'GET', BROWSER_UA);
      } catch {
        // Network error on retry — keep the original 403 result
        return { status: 403, finalUrl: res.url };
      }

      if (retryRes.status === 200 || (retryRes.status >= 300 && retryRes.status < 400)) {
        // Page exists — bot-blocking only, not truly broken
        return { status: retryRes.status, finalUrl: retryRes.url, botBlocked: true };
      }
      // 404, 410, or another 403 on the browser retry
      return { status: retryRes.status, finalUrl: retryRes.url };
    }

    return { status: res.status, finalUrl: res.url };
  } catch (err) {
    const message = err.name === 'AbortError' ? 'timeout' : err.message;
    return { status: 0, error: message };
  }
}

// ---------------------------------------------------------------------------
// Concurrency helper
// ---------------------------------------------------------------------------

async function runWithConcurrency(tasks, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const rootDir = process.cwd();
  console.log(`\n🔗 LawnBudAI Link Checker — scanning ${rootDir}\n`);

  // Collect all source files
  const files = walkDir(rootDir).filter(
    f => !SKIP_PATH_PATTERNS.some(re => re.test(f))
  );

  // Extract unique URLs and track which files reference them
  const urlMap = new Map(); // url → Set<filePath>
  for (const file of files) {
    const urls = extractUrlsFromFile(file);
    for (const url of urls) {
      if (!urlMap.has(url)) urlMap.set(url, new Set());
      urlMap.get(url).add(path.relative(rootDir, file));
    }
  }

  const uniqueUrls = [...urlMap.keys()];
  console.log(`Found ${uniqueUrls.length} unique external URL(s) across ${files.length} file(s)\n`);

  if (uniqueUrls.length === 0) {
    console.log('✅ No external links to check.\n');
    process.exit(0);
  }

  // Check all URLs with bounded concurrency
  const tasks = uniqueUrls.map(url => async () => {
    const result = await checkUrl(url);
    return { url, ...result, files: [...urlMap.get(url)] };
  });

  process.stdout.write('Checking');
  const interval = setInterval(() => process.stdout.write('.'), 1000);
  const results = await runWithConcurrency(tasks, CONCURRENCY);
  clearInterval(interval);
  console.log('\n');

  // Categorise results
  const broken = [];
  const warnings = [];
  const ok = [];

  for (const r of results) {
    if (r.error || BROKEN_STATUSES.has(r.status)) {
      broken.push(r);
    } else if (WARN_STATUSES.has(r.status) && !r.botBlocked) {
      // 403/429 that persisted even with a browser UA = truly unresolvable
      warnings.push(r);
    } else {
      ok.push(r);
    }
  }

  // Report
  if (ok.length > 0) {
    console.log(`✅ ${ok.length} link(s) OK`);
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} link(s) returned ${[...WARN_STATUSES].join('/')} (likely bot-blocking, verify manually):`);
    for (const r of warnings) {
      console.log(`   [${r.status}] ${r.url}`);
      console.log(`         in: ${r.files.join(', ')}`);
    }
  }

  if (broken.length > 0) {
    console.log(`\n❌ ${broken.length} BROKEN link(s) found — fix before merging:\n`);
    for (const r of broken) {
      const status = r.error ? `ERROR (${r.error})` : r.status;
      console.log(`   [${status}] ${r.url}`);
      console.log(`         in: ${r.files.join(', ')}`);
    }
    console.log();
    process.exit(1);
  }

  console.log('\n✅ All external links are valid.\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Link checker crashed:', err);
  process.exit(1);
});
