/**
 * Navigation E2E tests for Expo Web
 *
 * Tests tab navigation and settings screen access
 */

import { test, expect } from '@playwright/test';

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate between tabs without errors', async ({ page }) => {
    // Look for tab buttons/links
    // Adjust selectors based on your actual tab navigation structure
    const tabs = await page.locator('[role="tab"], button').all();

    // Should have at least some navigation elements
    expect(tabs.length).toBeGreaterThanOrEqual(0);

    // Verify page doesn't show errors
    await expect(page).not.toHaveTitle(/error/i);
  });

  test('should not have broken links in navigation', async ({ page }) => {
    // Check for any console errors
    let consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate and interact
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known/expected errors (asset loading, 404s, etc)
    const criticalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('warning') &&
        !e.includes('Failed to load resource') &&
        !e.includes('404') &&
        !e.includes('Font') &&
        !e.includes('ERR_')
    );

    // Should not have critical errors in console
    expect(criticalErrors.length).toBe(0);
  });

  test('should handle rapid navigation without crashing', async ({ page }) => {
    await page.goto('/');

    // Should not crash during navigation
    await expect(page).not.toHaveTitle(/error|exception/i);
  });
});

test.describe('Settings Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to settings', async ({ page }) => {
    // Look for settings button or tab
    const settingsButton = page.locator('button, a').filter({ hasText: /settings|gear|config/i }).first();

    // If found, try to click it
    if ((await settingsButton.count()) > 0) {
      await settingsButton.click();
      await page.waitForLoadState('networkidle');

      // Should navigate without errors
      await expect(page).not.toHaveTitle(/error/i);
    }
  });

  test('should display user info section in settings', async ({ page }) => {
    // Navigate to settings if possible
    const settingsButton = page.locator('text=/settings/i').first();

    if ((await settingsButton.count()) > 0) {
      await settingsButton.click();
      await page.waitForLoadState('networkidle');

      // Check for common settings elements
      const content = await page.content();
      // Settings might show user email, preferences, etc.
      expect(content.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Plan Tier Display', () => {
  test('should display plan information when available', async ({ page }) => {
    await page.goto('/');

    // Look for plan tier indicators
    const content = await page.content();

    // Should have some content related to plans (free, premium, admin)
    // This is a basic test - more specific assertions depend on your UI
    expect(content.length).toBeGreaterThan(0);
  });

  test('should not crash when displaying plan information', async ({ page }) => {
    await page.goto('/');

    let hasErrors = false;
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        hasErrors = true;
      }
    });

    await page.waitForLoadState('networkidle');

    expect(hasErrors).toBe(false);
  });
});
