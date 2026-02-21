import { test, expect } from '@playwright/test';
import { signInTestUser } from './auth-setup';

test('debug form rendering', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Check if we need to authenticate
  let content = await page.content();
  const needsAuth = content.includes('Sign In') || content.includes('sign in');

  if (needsAuth) {
    await signInTestUser(page);
    await page.waitForTimeout(2000);
  }

  // Check current page state after auth
  content = await page.content();
  console.log('URL after auth attempt:', page.url());
  console.log('Is on sign-in page:', content.includes('Sign In'));
  console.log('Page contains mow/water tabs:', content.includes('Mow') || content.includes('Water'));

  // Navigate to Mowing tab
  const mowingTab = page.locator('button, a, [role="button"]').filter({ hasText: /mow/i }).first();
  console.log('Found mowing tabs:', await mowingTab.count());

  if (await mowingTab.count() > 0) {
    await mowingTab.click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Clicked mowing tab');
  } else {
    console.log('✗ Could not find mowing tab, listing available buttons/links:');
    const allButtons = await page.locator('button, a, [role="button"]').all();
    for (let i = 0; i < Math.min(allButtons.length, 5); i++) {
      const text = await (await allButtons)[i].textContent();
      console.log(`  [${i}]: ${text}`);
    }
  }

  // Get all form elements
  const allInputs = page.locator('input').all();
  const allTextareas = page.locator('textarea').all();
  const allButtons = page.locator('button').all();
  const allDivsWithRole = page.locator('[role="button"]').all();

  console.log('=== FORM DEBUG ===');
  console.log('Total <input> tags:', (await allInputs).length);
  console.log('Total <textarea> tags:', (await allTextareas).length);
  console.log('Total <button> tags:', (await allButtons).length);
  console.log('Total [role="button"] divs:', (await allDivsWithRole).length);

  // Get HTML of first few inputs
  const firstInputs = await page.locator('input').evaluateAll(els =>
    els.slice(0, 5).map(el => ({
      tag: el.tagName,
      type: el.getAttribute('type'),
      placeholder: el.getAttribute('placeholder'),
      className: el.getAttribute('class'),
      outerHTML: el.outerHTML.substring(0, 150),
    }))
  );

  console.log('First inputs:', JSON.stringify(firstInputs, null, 2));

  // Get the page content to see the structure
  content = await page.content();

  // Look for TextInput components (they might be under specific class names)
  if (content.includes('placeholder="YYYY-MM-DD')) {
    console.log('✓ Found date input with placeholder');
  } else {
    console.log('✗ Date input not found');
  }

  if (content.includes('placeholder="2.5')) {
    console.log('✓ Found height input with placeholder');
  } else {
    console.log('✗ Height input not found');
  }

  if (content.includes('placeholder="Any notes')) {
    console.log('✓ Found notes input with placeholder');
  } else {
    console.log('✗ Notes input not found');
  }

  expect(true).toBe(true);
});
