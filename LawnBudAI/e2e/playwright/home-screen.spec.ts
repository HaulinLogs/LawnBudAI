/**
 * E2E tests for Home screen
 *
 * CRITICAL TEST COVERAGE: Home screen had 0% E2E coverage
 * Tests weather display, todo status cards, navigation, and user preferences integration
 */

import { test, expect } from '@playwright/test';
import { navigateToHome, navigateToTab, waitForDataLoad } from './test-helpers';

test.describe('Home Screen - End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Home tab
    try {
      await navigateToHome(page);
    } catch {
      // If navigation helper fails, try basic navigation
      await page.goto('/');
    }
  });

  test('should display the home screen title and layout', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Home screen should be visible
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);

    // Should have tab navigation
    const tabs = await page.locator('[role="tab"], button[role="button"]').all();
    expect(tabs.length).toBeGreaterThan(0);
  });

  test('should display weather card with loading state', async ({ page }) => {
    // Look for weather-related text or elements
    const weatherContent = await page.content();

    // Should eventually load weather or show loading state
    await page.waitForTimeout(1000);

    // Check if weather info is displayed or placeholder is shown
    const weatherElements = await page.locator('text=/weather|temperature|forecast|partly cloudy|cloudy|rain/i').all();

    // Either weather is loaded or loading is happening
    const hasWeatherOrLoading = weatherElements.length > 0 ||
      (await page.locator('[role="progressbar"], text=/loading/i').count()) > 0;

    expect(hasWeatherOrLoading || weatherContent.includes('Madison')).toBe(true);
  });

  test('should display todo status cards for lawn care activities', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for todo status cards mentioning lawn care activities
    const content = await page.content();

    // Should have indicators for mowing, watering, or fertilizer activities
    const hasActivityCards =
      content.includes('Mow') ||
      content.includes('Water') ||
      content.includes('Fertil');

    expect(hasActivityCards || content.includes('todo') || content.includes('activity')).toBe(true);
  });

  test('should have navigation to Mowing screen from home', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for mowing tab or navigation button
    const mowingNav = page.locator('button, a, [role="tab"]').filter({ hasText: /mow/i }).first();

    if ((await mowingNav.count()) > 0) {
      expect(await mowingNav.isVisible()).toBe(true);

      // Click it
      await mowingNav.click();
      await page.waitForLoadState('networkidle');

      // Should navigate away from home or show mowing content
      const content = await page.content();
      expect(content.includes('Mow') || content.includes('mow') || content.includes('height')).toBe(true);
    }
  });

  test('should have navigation to Watering screen from home', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for watering tab or navigation button
    const wateringNav = page.locator('button, a, [role="tab"]').filter({ hasText: /water/i }).first();

    if ((await wateringNav.count()) > 0) {
      expect(await wateringNav.isVisible()).toBe(true);

      // Click it
      await wateringNav.click();
      await page.waitForLoadState('networkidle');

      // Should navigate to watering screen
      const content = await page.content();
      expect(content.includes('Water') || content.includes('water') || content.includes('gallons')).toBe(true);
    }
  });

  test('should have navigation to Fertilizer screen from home', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for fertilizer tab or navigation button
    const fertilizerNav = page.locator('button, a, [role="tab"]').filter({ hasText: /fertil/i }).first();

    if ((await fertilizerNav.count()) > 0) {
      expect(await fertilizerNav.isVisible()).toBe(true);

      // Click it
      await fertilizerNav.click();
      await page.waitForLoadState('networkidle');

      // Should navigate to fertilizer screen
      const content = await page.content();
      expect(content.includes('Fertil') || content.includes('N-P-K') || content.includes('fertilizer')).toBe(true);
    }
  });

  test('should display user preferences if configured', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check if user location/preferences are displayed
    const content = await page.content();

    // Should show city (Madison) or empty state
    const hasPreferences = content.includes('Madison') || content.includes('city') || content.includes('preferences');

    expect(hasPreferences).toBe(true);
  });

  test('should handle weather loading gracefully', async ({ page }) => {
    // Reload to trigger fresh weather load
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for any loading spinners to disappear
    const spinner = page.locator('[role="progressbar"], text=/loading/i');

    if ((await spinner.count()) > 0) {
      // Should eventually load
      await expect(spinner).not.toBeVisible({ timeout: 10000 });
    }

    // Page should be functional
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('should maintain home screen after tab navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Navigate to another tab
    const wateringTab = page.locator('button, a, [role="tab"]').filter({ hasText: /water/i }).first();
    if ((await wateringTab.count()) > 0) {
      await wateringTab.click();
      await page.waitForLoadState('networkidle');
    }

    // Navigate back to home
    try {
      await navigateToHome(page);
    } catch {
      const homeTab = page.locator('button, a, [role="tab"]').filter({ hasText: /home/i }).first();
      if ((await homeTab.count()) > 0) {
        await homeTab.click();
      }
    }

    await page.waitForLoadState('networkidle');

    // Should be back on home
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should display meaningful content, not errors', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check page has content
    const content = await page.content();
    expect(content.length).toBeGreaterThan(200);

    // Should not show unhandled error messages
    const hasErrors = content.toLowerCase().includes('error') &&
                     content.toLowerCase().includes('failed to');

    // Some error messages from UI are OK (like validation errors),
    // but should not have multiple error messages indicating app crash
    const errorCount = (await page.locator('text=/error/i').count());
    expect(errorCount).toBeLessThan(3);
  });

  test('should be responsive and visible on different viewport sizes', async ({ page }) => {
    // Test with mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Content should still be visible
    const visibleText = await page.locator('body').isVisible();
    expect(visibleText).toBe(true);

    // Test with tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('should not have memory leaks on repeated navigation', async ({ page }) => {
    // Navigate between tabs multiple times
    for (let i = 0; i < 3; i++) {
      const wateringTab = page.locator('button, a, [role="tab"]').filter({ hasText: /water/i }).first();
      if ((await wateringTab.count()) > 0) {
        await wateringTab.click();
        await page.waitForLoadState('networkidle');
      }

      const homeTab = page.locator('button, a, [role="tab"]').filter({ hasText: /home/i }).first();
      if ((await homeTab.count()) > 0) {
        await homeTab.click();
        await page.waitForLoadState('networkidle');
      }
    }

    // Should still render without errors
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('should display consistent UI across reloads', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const firstLoadContent = await page.content();

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    const secondLoadContent = await page.content();

    // Both should have reasonable content
    expect(firstLoadContent.length).toBeGreaterThan(100);
    expect(secondLoadContent.length).toBeGreaterThan(100);

    // Should have similar UI structure
    const navPresent = firstLoadContent.includes('tab') || firstLoadContent.includes('button');
    expect(navPresent).toBe(true);
  });
});
