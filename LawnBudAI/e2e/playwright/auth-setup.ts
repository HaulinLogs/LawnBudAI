/**
 * Authentication setup for E2E tests
 *
 * This module provides functions to set up authentication state in test sessions
 * Credentials must be provided via environment variables:
 *   TEST_USER_EMAIL - Email address for test user
 *   TEST_USER_PASSWORD - Password for test user
 */

import { Page, BrowserContext } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL || '';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || '';

/**
 * Validate that test credentials are configured
 */
function validateTestCredentials() {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    throw new Error(
      'Test credentials not configured. Please set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables.'
    );
  }
}

/**
 * Sign up a test user (runs once per test session)
 */
export async function signUpTestUser(page: Page) {
  validateTestCredentials();
  await page.goto('/sign-up');

  // Fill in email
  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  if (await emailInput.count() > 0) {
    await emailInput.fill(TEST_EMAIL);
  }

  // Fill in password
  const passwordInputs = page.locator('input[type="password"]').all();
  if ((await passwordInputs).length >= 1) {
    await (await passwordInputs)[0].fill(TEST_PASSWORD);
  }
  if ((await passwordInputs).length >= 2) {
    await (await passwordInputs)[1].fill(TEST_PASSWORD);
  }

  // Click sign up button
  const signUpButton = page.locator('button').filter({ hasText: /sign up|register|create/i }).first();
  if (await signUpButton.count() > 0) {
    await signUpButton.click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Sign in with test user credentials
 *
 * Before running E2E tests, you must:
 * 1. Create a test user in your Supabase project
 * 2. Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables
 *
 * Example setup:
 * - Go to your Supabase project > Authentication > Users
 * - Create a new user with test credentials
 * - Add TEST_USER_EMAIL and TEST_USER_PASSWORD to .env.local
 */
export async function signInTestUser(page: Page) {
  validateTestCredentials();

  // Navigate to sign-in page
  const url = page.url();
  if (!url.includes('sign-in')) {
    await page.goto('/sign-in');
  }

  // Wait for form to load
  await page.waitForLoadState('networkidle');

  // Try to find email input (may have different selectors in React Native Web)
  const emailInputs = await page.locator('input[type="email"]').all();
  if (emailInputs.length > 0) {
    await emailInputs[0].fill(TEST_EMAIL);
  } else {
    console.warn('Could not find email input on sign-in page');
  }

  // Try to find password input
  const passwordInputs = await page.locator('input[type="password"]').all();
  if (passwordInputs.length > 0) {
    await passwordInputs[0].fill(TEST_PASSWORD);
  } else {
    console.warn('Could not find password input on sign-in page');
  }

  // Look for sign in button (may be TouchableOpacity rendered as div[role="button"])
  const signInButtons = await page.locator('button, [role="button"]').filter({ hasText: /sign in|login|sign-in/i }).all();

  if (signInButtons.length > 0) {
    await signInButtons[0].click();

    // Wait for auth to complete
    await page.waitForTimeout(3000);

    // Check if we're authenticated by checking URL or content
    const currentUrl = page.url();
    const content = await page.content();

    // If redirected away from sign-in page, auth likely succeeded
    if (!currentUrl.includes('sign-in')) {
      return true;
    }

    // If still on sign-in page, check for error messages
    if (content.includes('Error') || content.includes('invalid') || content.includes('failed')) {
      console.warn(
        `Authentication failed. Please verify test credentials are configured:\n` +
        `TEST_USER_EMAIL: ${TEST_EMAIL || '(not set)'}\n` +
        `TEST_USER_PASSWORD: ${TEST_PASSWORD ? '(set)' : '(not set)'}\n\n` +
        `To create a test user:\n` +
        `1. Go to Supabase project > Authentication > Users\n` +
        `2. Create new user with the same email and password\n` +
        `3. Ensure email is confirmed in Supabase`
      );
    }

    return false;
  } else {
    console.warn('Could not find sign-in button');
    return false;
  }
}

/**
 * Check if user is currently authenticated
 */
export async function isUserAuthenticated(page: Page): Promise<boolean> {
  const content = await page.content();

  // Check for authenticated content indicators
  const hasTabNavigation = content.includes('button') && content.includes('Mow');
  const hasAuthPage = content.includes('Sign In') || content.includes('sign in');

  return hasTabNavigation && !hasAuthPage;
}
