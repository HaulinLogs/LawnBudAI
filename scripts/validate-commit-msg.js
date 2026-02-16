#!/usr/bin/env node

/**
 * Validate commit message format
 * Ensures all commits reference a GitHub issue
 *
 * Format required:
 * #ISSUE_NUMBER: Brief description
 *
 * Longer explanation...
 *
 * Closes #ISSUE_NUMBER
 */

const fs = require('fs');
const path = require('path');

// Get commit message from husky
const commitMsgFile = process.argv[2];
const commitMessage = fs.readFileSync(commitMsgFile, 'utf-8').trim();

const errors = [];

// Check if message starts with #NUMBER:
const issueNumberMatch = commitMessage.match(/^#(\d+):\s+/);
if (!issueNumberMatch) {
  errors.push('❌ Commit message must start with #ISSUE_NUMBER: (e.g., #6: Fix bug)');
}

// Check if message includes Closes #NUMBER
const closesMatch = commitMessage.match(/\nCloses\s+#(\d+)/i);
if (!closesMatch) {
  errors.push('❌ Commit message must include "Closes #ISSUE_NUMBER" to auto-link the issue');
}

// Check that the issue number is the same in both places
if (issueNumberMatch && closesMatch) {
  const issueNum1 = issueNumberMatch[1];
  const issueNum2 = closesMatch[1];
  if (issueNum1 !== issueNum2) {
    errors.push(`❌ Issue numbers don't match: #${issueNum1} in title vs #${issueNum2} in Closes`);
  }
}

// Check first line length (should be ~50 chars)
const firstLine = commitMessage.split('\n')[0];
if (firstLine.length > 72) {
  errors.push(`⚠️  First line is ${firstLine.length} chars (aim for ~50-60)`);
}

// Check that Closes is on its own line with proper format
const lines = commitMessage.split('\n');
const closesLine = lines.find(line => line.match(/^Closes\s+#\d+/i));
if (closesLine && closesLine.trim().match(/^Closes\s+#\d+\s*$/i)) {
  // Good - Closes is on its own line
} else if (!closesLine) {
  // Already caught above
} else {
  errors.push('⚠️  "Closes #X" should be on its own line');
}

if (errors.length > 0) {
  console.error('\n❌ Commit message validation failed:\n');
  errors.forEach(error => console.error(error));
  console.error('\n📋 Required format:\n');
  console.error('#6: Brief description of change\n');
  console.error('Longer explanation of what changed and why.\n');
  console.error('Closes #6\n');
  console.error('📖 See CONTRIBUTING.md for examples.\n');
  process.exit(1);
}

console.log('✅ Commit message is valid');
process.exit(0);
