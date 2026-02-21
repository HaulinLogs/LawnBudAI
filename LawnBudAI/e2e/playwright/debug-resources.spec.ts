import { test, expect } from '@playwright/test';

test('debug resource loading', async ({ page }) => {
  const failedRequests: string[] = [];
  
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()}`);
  });

  await page.goto('/');
  
  // Give time for all resources to load
  await page.waitForTimeout(3000);

  console.log('Failed requests:');
  failedRequests.forEach(r => console.log('  -', r));

  // Check what's actually in the HTML
  const html = await page.content();
  console.log('\nHTML length:', html.length);
  console.log('Contains root div:', html.includes('<div id="root"'));
  console.log('Contains script tag:', html.includes('<script'));

  // List all scripts
  const scripts = await page.locator('script').count();
  console.log('Script tags:', scripts);

  // Check if main bundle is loading
  const hasBundleScript = html.includes('_expo/static/js/web/entry');
  console.log('Has bundle script:', hasBundleScript);

  expect(true).toBe(true);
});
