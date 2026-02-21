import { test, expect } from '@playwright/test';

test('debug auth and form rendering', async ({ page }) => {
  // Check auth state
  let authErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      authErrors.push(msg.text());
      console.log('[ERROR]', msg.text());
    }
  });

  // Navigate to app
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Check if we're on sign-in page or app
  const pageContent = await page.content();
  const onSignInPage = pageContent.includes('Sign In') || pageContent.includes('sign in');
  const isAuthenticated = pageContent.includes('tabs') || pageContent.includes('Mowing') || pageContent.includes('Watering');

  console.log('On sign-in page:', onSignInPage);
  console.log('Is authenticated:', isAuthenticated);
  console.log('Auth errors:', authErrors.length > 0 ? authErrors : 'None');

  // Check for any elements on page
  const inputs = await page.locator('input').count();
  const buttons = await page.locator('button').count();
  const textareas = await page.locator('textarea').count();

  console.log('Total inputs:', inputs);
  console.log('Total buttons:', buttons);
  console.log('Total textareas:', textareas);

  // Check for form labels
  const labels = await page.locator('text=/Date|Height|Amount|Notes/i').count();
  console.log('Form labels found:', labels);

  expect(true).toBe(true);
});
