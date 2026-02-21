import { test, expect } from '@playwright/test';

test('debug form selectors', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Navigate to Mowing tab
  const mowingTab = page.locator('button, a').filter({ hasText: /mow/i }).first();
  if ((await mowingTab.count()) > 0) {
    await mowingTab.click();
    await page.waitForLoadState('networkidle');
  }

  // Check what's actually in the page
  const pageContent = await page.content();
  
  // Look for testID
  const hasTestId = pageContent.includes('data-testid');
  console.log('Has data-testid:', hasTestId);
  
  // Look for text input
  const inputs = await page.locator('input').count();
  console.log('Total inputs found:', inputs);
  
  // Look for all buttons
  const buttons = await page.locator('button').count();
  console.log('Total buttons found:', buttons);
  
  // Look for divs with role=button
  const buttonDivs = await page.locator('[role="button"]').count();
  console.log('Divs with role=button:', buttonDivs);
  
  // Print a snippet of HTML
  const formArea = await page.locator('div').first();
  const html = await formArea.evaluate(el => el.outerHTML);
  console.log('Form HTML sample:', html.substring(0, 500));
  
  expect(true).toBe(true);
});
