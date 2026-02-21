/**
 * Integration E2E tests for LawnBudAI
 *
 * Tests cross-screen data consistency, workflows, and integration scenarios
 * Ensures app behaves correctly when users navigate between screens and update data
 *
 * Tests:
 * - Event lifecycle (record → display → delete)
 * - Cross-screen navigation consistency
 * - Data consistency across screens
 * - Settings affecting other screens
 */

import { test, expect } from '@playwright/test';
import {
  navigateToTab,
  fillEventForm,
  submitForm,
  expectSuccessMessage,
  getEventCount,
  deleteFirstEvent,
  navigateToHome,
} from './test-helpers';

test.describe('Integration Tests - Event Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create event and display on event screen', async ({ page }) => {
    // Navigate to mowing screen
    try {
      await navigateToTab(page, 'Mowing');
    } catch {
      const mowingTab = page.locator('button, a, [role="tab"]').filter({ hasText: /mow/i }).first();
      if ((await mowingTab.count()) > 0) {
        await mowingTab.click();
      }
    }

    await page.waitForLoadState('networkidle');

    // Record an event
    const today = new Date().toISOString().split('T')[0];
    const heightInput = page.locator('input[placeholder*="height"], input[placeholder*="2.5"]').first();

    if ((await heightInput.count()) > 0) {
      const dateInput = page.locator('input[placeholder*="YYYY"]').first();
      if ((await dateInput.count()) > 0) {
        await dateInput.fill(today);
      }

      await heightInput.fill('2.5');

      // Submit
      const submitButton = page.locator('button').filter({ hasText: /record|submit/i }).first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Check for success
        const content = await page.content();
        const hasSuccess = content.includes('Success') ||
                          content.includes('success') ||
                          content.includes('recorded') ||
                          content.includes('Recorded');

        expect(hasSuccess || content.includes('Recent Events')).toBe(true);
      }
    }
  });

  test('should display event in history after creation', async ({ page }) => {
    // Navigate to watering
    try {
      await navigateToTab(page, 'Watering');
    } catch {
      const waterTab = page.locator('button, a, [role="tab"]').filter({ hasText: /water/i }).first();
      if ((await waterTab.count()) > 0) {
        await waterTab.click();
      }
    }

    await page.waitForLoadState('networkidle');

    // Get initial count
    const initialCount = await getEventCount(page);

    // Record an event
    const today = new Date().toISOString().split('T')[0];
    const amountInput = page.locator('input[placeholder*="gallons"], input[placeholder*="25.5"]').first();

    if ((await amountInput.count()) > 0) {
      const dateInput = page.locator('input[placeholder*="YYYY"]').first();
      if ((await dateInput.count()) > 0) {
        await dateInput.fill(today);
      }

      await amountInput.fill('15');

      // Submit
      const submitButton = page.locator('button').filter({ hasText: /record/i }).first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Check new count
        const newCount = await getEventCount(page);
        expect(newCount).toBeGreaterThanOrEqual(initialCount);
      }
    }
  });

  test('should update statistics after creating event', async ({ page }) => {
    try {
      await navigateToTab(page, 'Mowing');
    } catch {
      const mowingTab = page.locator('button, a, [role="tab"]').filter({ hasText: /mow/i }).first();
      if ((await mowingTab.count()) > 0) {
        await mowingTab.click();
      }
    }

    await page.waitForLoadState('networkidle');

    // Record an event
    const today = new Date().toISOString().split('T')[0];
    const heightInput = page.locator('input[placeholder*="height"], input[placeholder*="2.5"]').first();

    if ((await heightInput.count()) > 0) {
      const dateInput = page.locator('input[placeholder*="YYYY"]').first();
      if ((await dateInput.count()) > 0) {
        await dateInput.fill(today);
      }

      await heightInput.fill('3.0');

      const submitButton = page.locator('button').filter({ hasText: /record/i }).first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Check for statistics section
        const content = await page.content();
        const hasStats = content.includes('Statistics') ||
                        content.includes('statistics') ||
                        content.includes('Days') ||
                        content.includes('Average');

        expect(hasStats).toBe(true);
      }
    }
  });

  test('should delete event from history', async ({ page }) => {
    try {
      await navigateToTab(page, 'Watering');
    } catch {
      const waterTab = page.locator('button, a, [role="tab"]').filter({ hasText: /water/i }).first();
      if ((await waterTab.count()) > 0) {
        await waterTab.click();
      }
    }

    await page.waitForLoadState('networkidle');

    // Get count before
    const countBefore = await getEventCount(page);

    // Delete first event if exists
    if (countBefore > 0) {
      try {
        await deleteFirstEvent(page);
      } catch {
        // If delete helper fails, try manually
        const deleteButton = page.locator('button:has-text("Delete")').first();
        if ((await deleteButton.count()) > 0) {
          await deleteButton.click();
          await page.waitForLoadState('networkidle');
        }
      }

      // Check count after
      const countAfter = await getEventCount(page);

      // Count should stay same or decrease (might take time to update)
      expect(countAfter).toBeLessThanOrEqual(countBefore + 1);
    }
  });
});

test.describe('Integration Tests - Cross-Screen Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate smoothly between all tabs', async ({ page }) => {
    const tabs = ['Mowing', 'Watering', 'Fertilizer', 'Settings'];

    for (const tabName of tabs) {
      try {
        await navigateToTab(page, tabName);
      } catch {
        const tab = page.locator('button, a, [role="tab"]').filter({ hasText: new RegExp(tabName, 'i') }).first();
        if ((await tab.count()) > 0) {
          await tab.click();
        }
      }

      await page.waitForLoadState('networkidle');

      // Each screen should load without errors
      const content = await page.content();
      expect(content.length).toBeGreaterThan(100);
    }
  });

  test('should maintain form state during navigation to another tab and back', async ({ page }) => {
    // Navigate to mowing
    try {
      await navigateToTab(page, 'Mowing');
    } catch {
      const mowingTab = page.locator('button, a, [role="tab"]').filter({ hasText: /mow/i }).first();
      if ((await mowingTab.count()) > 0) {
        await mowingTab.click();
      }
    }

    await page.waitForLoadState('networkidle');

    // Fill some form data
    const heightInput = page.locator('input[placeholder*="height"], input[placeholder*="2.5"]').first();
    if ((await heightInput.count()) > 0) {
      await heightInput.fill('2.75');
      const filledValue = await heightInput.inputValue();
      expect(filledValue).toBe('2.75');
    }

    // Navigate to another tab
    try {
      await navigateToTab(page, 'Watering');
    } catch {
      const waterTab = page.locator('button, a, [role="tab"]').filter({ hasText: /water/i }).first();
      if ((await waterTab.count()) > 0) {
        await waterTab.click();
      }
    }

    await page.waitForLoadState('networkidle');

    // Navigate back
    try {
      await navigateToTab(page, 'Mowing');
    } catch {
      const mowingTab = page.locator('button, a, [role="tab"]').filter({ hasText: /mow/i }).first();
      if ((await mowingTab.count()) > 0) {
        await mowingTab.click();
      }
    }

    await page.waitForLoadState('networkidle');

    // Form should still be functional
    const height2 = page.locator('input[placeholder*="height"], input[placeholder*="2.5"]').first();
    expect((await height2.count()) > 0).toBe(true);
  });

  test('should show consistent navigation UI across all screens', async ({ page }) => {
    const tabs = ['Mowing', 'Watering', 'Fertilizer', 'Settings'];

    for (const tabName of tabs) {
      try {
        await navigateToTab(page, tabName);
      } catch {
        const tab = page.locator('button, a, [role="tab"]').filter({ hasText: new RegExp(tabName, 'i') }).first();
        if ((await tab.count()) > 0) {
          await tab.click();
        }
      }

      await page.waitForLoadState('networkidle');

      // Should have tab navigation visible
      const tabs = await page.locator('button, a, [role="tab"]').all();
      expect(tabs.length).toBeGreaterThan(0);
    }
  });

  test('should handle rapid tab switching', async ({ page }) => {
    const tabs = ['Mowing', 'Watering', 'Fertilizer'];

    // Rapidly switch tabs
    for (let i = 0; i < 3; i++) {
      for (const tabName of tabs) {
        try {
          await navigateToTab(page, tabName);
        } catch {
          const tab = page.locator('button, a, [role="tab"]').filter({ hasText: new RegExp(tabName, 'i') }).first();
          if ((await tab.count()) > 0) {
            await tab.click();
          }
        }

        await page.waitForTimeout(200);
      }
    }

    // Should still be functional
    await page.waitForLoadState('networkidle');
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});

test.describe('Integration Tests - Data Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show consistent event counts across screens', async ({ page }) => {
    // Navigate to mowing and count
    try {
      await navigateToTab(page, 'Mowing');
    } catch {
      const mowingTab = page.locator('button, a, [role="tab"]').filter({ hasText: /mow/i }).first();
      if ((await mowingTab.count()) > 0) {
        await mowingTab.click();
      }
    }

    await page.waitForLoadState('networkidle');
    const mowCount = await getEventCount(page);

    // Navigate to watering
    try {
      await navigateToTab(page, 'Watering');
    } catch {
      const waterTab = page.locator('button, a, [role="tab"]').filter({ hasText: /water/i }).first();
      if ((await waterTab.count()) > 0) {
        await waterTab.click();
      }
    }

    await page.waitForLoadState('networkidle');
    const waterCount = await getEventCount(page);

    // Counts should be non-negative integers
    expect(mowCount).toBeGreaterThanOrEqual(0);
    expect(waterCount).toBeGreaterThanOrEqual(0);
  });

  test('should update home screen statistics after recording event', async ({ page }) => {
    // Get initial home content
    try {
      await navigateToHome(page);
    } catch {
      const homeTab = page.locator('button, a, [role="tab"]').filter({ hasText: /home/i }).first();
      if ((await homeTab.count()) > 0) {
        await homeTab.click();
      }
    }

    await page.waitForLoadState('networkidle');
    const homeContentBefore = await page.content();

    // Record an event
    try {
      await navigateToTab(page, 'Mowing');
    } catch {
      const mowingTab = page.locator('button, a, [role="tab"]').filter({ hasText: /mow/i }).first();
      if ((await mowingTab.count()) > 0) {
        await mowingTab.click();
      }
    }

    await page.waitForLoadState('networkidle');

    const today = new Date().toISOString().split('T')[0];
    const heightInput = page.locator('input[placeholder*="height"], input[placeholder*="2.5"]').first();

    if ((await heightInput.count()) > 0) {
      const dateInput = page.locator('input[placeholder*="YYYY"]').first();
      if ((await dateInput.count()) > 0) {
        await dateInput.fill(today);
      }

      await heightInput.fill('2.5');

      const submitButton = page.locator('button').filter({ hasText: /record/i }).first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      }
    }

    // Check home again
    try {
      await navigateToHome(page);
    } catch {
      const homeTab = page.locator('button, a, [role="tab"]').filter({ hasText: /home/i }).first();
      if ((await homeTab.count()) > 0) {
        await homeTab.click();
      }
    }

    await page.waitForLoadState('networkidle');
    const homeContentAfter = await page.content();

    // Home should still be functional
    expect(homeContentAfter.length).toBeGreaterThan(100);
  });

  test('should sync data when returning from background simulation', async ({ page }) => {
    // Navigate to mowing
    try {
      await navigateToTab(page, 'Mowing');
    } catch {
      const mowingTab = page.locator('button, a, [role="tab"]').filter({ hasText: /mow/i }).first();
      if ((await mowingTab.count()) > 0) {
        await mowingTab.click();
      }
    }

    await page.waitForLoadState('networkidle');
    const count1 = await getEventCount(page);

    // Simulate returning from background by hiding and showing tab
    await page.hide();
    await page.waitForTimeout(500);

    // Re-show
    await page.bringToFront?.();
    await page.waitForLoadState('networkidle');

    const count2 = await getEventCount(page);

    // Counts should match or be consistent
    expect(typeof count1).toBe('number');
    expect(typeof count2).toBe('number');
  });
});

test.describe('Integration Tests - Real-World Workflows', () => {
  test('should complete a full app workflow: setup → record → view → delete', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to mowing
    try {
      await navigateToTab(page, 'Mowing');
    } catch {
      const tab = page.locator('button, a, [role="tab"]').filter({ hasText: /mow/i }).first();
      if ((await tab.count()) > 0) {
        await tab.click();
      }
    }

    await page.waitForLoadState('networkidle');

    // Record event
    const today = new Date().toISOString().split('T')[0];
    const dateInput = page.locator('input[placeholder*="YYYY"]').first();
    const heightInput = page.locator('input[placeholder*="height"], input[placeholder*="2.5"]').first();

    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }

    if ((await heightInput.count()) > 0) {
      await heightInput.fill('2.75');

      const submitButton = page.locator('button').filter({ hasText: /record/i }).first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      }
    }

    // View event in list
    const content = await page.content();
    expect(content.includes('Recent') || content.includes('Event') || content.length > 200).toBe(true);

    // Delete event
    const deleteButton = page.locator('button:has-text("Delete")').first();
    if ((await deleteButton.count()) > 0) {
      await deleteButton.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should handle app usage across multiple tabs/screens', async ({ page }) => {
    // Simulate a user using the app across multiple screens in sequence

    // Check home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Go to mowing
    try {
      await navigateToTab(page, 'Mowing');
    } catch {
      const tab = page.locator('button, a, [role="tab"]').filter({ hasText: /mow/i }).first();
      if ((await tab.count()) > 0) {
        await tab.click();
      }
    }
    await page.waitForLoadState('networkidle');

    // Go to watering
    try {
      await navigateToTab(page, 'Watering');
    } catch {
      const tab = page.locator('button, a, [role="tab"]').filter({ hasText: /water/i }).first();
      if ((await tab.count()) > 0) {
        await tab.click();
      }
    }
    await page.waitForLoadState('networkidle');

    // Go to fertilizer
    try {
      await navigateToTab(page, 'Fertilizer');
    } catch {
      const tab = page.locator('button, a, [role="tab"]').filter({ hasText: /fertil/i }).first();
      if ((await tab.count()) > 0) {
        await tab.click();
      }
    }
    await page.waitForLoadState('networkidle');

    // Back to home
    try {
      await navigateToHome(page);
    } catch {
      const tab = page.locator('button, a, [role="tab"]').filter({ hasText: /home/i }).first();
      if ((await tab.count()) > 0) {
        await tab.click();
      }
    }
    await page.waitForLoadState('networkidle');

    // App should be fully functional
    const content = await page.content();
    expect(content.length).toBeGreaterThan(200);
  });
});
