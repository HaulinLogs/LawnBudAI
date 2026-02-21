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

  // Try to find email/password inputs
  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  if (await emailInput.count() > 0) {
    await emailInput.fill(TEST_EMAIL);
  }

  const passwordInput = page.locator('input[type="password"]').first();
  if (await passwordInput.count() > 0) {
    await passwordInput.fill(TEST_PASSWORD);
  }

  // Click sign in button
  const signInButton = page.locator('button').filter({ hasText: /sign in|login/i }).first();
  if (await signInButton.count() > 0) {
    await signInButton.click();

    // Wait for auth to complete and app to load
    try {
      await page.waitForLoadState('networkidle');

      // Give Supabase a moment to process auth
      await page.waitForTimeout(2000);

      // Check if we're authenticated by looking for tabs/authenticated content
      const content = await page.content();
      const isAuthenticated = content.includes('mow') ||
                             content.includes('water') ||
                             content.includes('Mow') ||
                             content.includes('Water');

      return isAuthenticated;
    } catch (e) {
      // Timeout is fine, continue
      return false;
    }
  }

  return false;
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
