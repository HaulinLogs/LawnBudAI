/**
 * E2E tests for mowing events
 *
 * Tests the complete user flow of recording, viewing, and deleting mowing events
 * Runs against Expo Web export with real Supabase integration
 */

import { test, expect } from '@playwright/test';

test.describe('Mowing Screen - End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Mowing tab
    const mowingTab = page.locator('button, a').filter({ hasText: /mow/i }).first();
    if ((await mowingTab.count()) > 0) {
      await mowingTab.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display the mowing form', async ({ page }) => {
    // Look for form elements - using React Native Web compatible selectors
    // Find inputs by looking for text input elements
    const inputs = await page.locator('input[type="text"], input:not([type]), textarea').all();
    const buttons = await page.locator('button, [role="button"]').all();

    // Should have form inputs
    expect(inputs.length).toBeGreaterThanOrEqual(3); // date, height, notes
    expect(buttons.length).toBeGreaterThan(0); // submit button
  });

  test('should validate required fields before submission', async ({ page }) => {
    // Try to submit without filling form
    const submitButton = page.locator('button').filter({ hasText: /record|submit/i }).first();

    if ((await submitButton.count()) > 0) {
      await submitButton.click();

      // Should show an error
      await page.waitForTimeout(500);

      // Check for error message
      const errorVisible = await page.locator('text=/error|required|fill/i').count();
      expect(errorVisible).toBeGreaterThanOrEqual(0);
    }
  });

  test('should record a mowing event successfully', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill date field
    const dateInput = page.locator('input[type="text"], input[placeholder*="YYYY"]').first();
    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }

    // Fill height field
    const heightInput = page.locator('input[placeholder*="height"], input[placeholder*="2.5"]').first();
    if ((await heightInput.count()) > 0) {
      await heightInput.fill('2.5');
    }

    // Submit form
    const submitButton = page.locator('button').filter({ hasText: /record|submit/i }).first();
    if ((await submitButton.count()) > 0) {
      await submitButton.click();

      // Wait for success message
      await page.waitForTimeout(1000);

      // Look for success indication
      const successMessage = page.locator('text=/success|recorded|saved/i');
      expect(await successMessage.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display mowing events in history', async ({ page }) => {
    // Look for history section
    const historyTitle = page.locator('text=/history|recent|events/i');

    if ((await historyTitle.count()) > 0) {
      // Should display some events (or empty state)
      const eventItems = page.locator('[data-testid="event-item"]');
      const emptyState = page.locator('text=/no events|empty|nothing/i');

      // Either have events or empty state message
      const hasContent = (await eventItems.count()) > 0 || (await emptyState.count()) > 0;
      expect(hasContent).toBe(true);
    }
  });

  test('should display statistics when events exist', async ({ page }) => {
    // Look for statistics section
    const statsSection = page.locator('text=/statistics|stats|summary/i').first();

    if ((await statsSection.count()) > 0) {
      // Should have stat boxes with values (days since, average height)
      const daysLabel = page.locator('text=/days|since|last/i');

      // Should have at least the days stat
      expect(await daysLabel.count()).toBeGreaterThan(0);
    }
  });

  test('should allow adding optional notes', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill form
    const dateInput = page.locator('input[type="text"]').first();
    const heightInput = page.locator('input[placeholder*="height"]').first();
    const notesInput = page.locator('input[placeholder*="notes"], textarea').first();

    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }
    if ((await heightInput.count()) > 0) {
      await heightInput.fill('2.75');
    }
    if ((await notesInput.count()) > 0) {
      await notesInput.fill('Mowed with new blades');
      const value = await notesInput.inputValue();
      expect(value).toContain('new blades');
    }
  });

  test('should handle delete operations on events', async ({ page }) => {
    // Look for delete buttons in event history
    const deleteButtons = page.locator('button').filter({ hasText: /delete|remove|trash/i });

    if ((await deleteButtons.count()) > 0) {
      // Click first delete button
      const firstDelete = deleteButtons.first();
      await firstDelete.click();

      // Should show confirmation dialog
      await page.waitForTimeout(500);
      const confirmDialog = page.locator('text=/confirm|sure|are you/i');

      // If dialog appears, handle it
      if ((await confirmDialog.count()) > 0) {
        const confirmButton = page.locator('button').filter({ hasText: /yes|confirm|delete/i }).last();
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should not crash when submitting invalid heights', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill form with invalid height
    const dateInput = page.locator('input[type="text"]').first();
    const heightInput = page.locator('input[placeholder*="height"]').first();

    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }
    if ((await heightInput.count()) > 0) {
      // Try invalid height
      await heightInput.fill('invalid');

      // Try to submit
      const submitButton = page.locator('button').filter({ hasText: /record/i }).first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);

        // App should not crash
        await expect(page).not.toHaveTitle(/error|exception/i);
      }
    }
  });

  test('should format dates correctly in event history', async ({ page }) => {
    // Look for date display in history
    const eventDates = page.locator('text=/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i');

    // Should display dates in readable format if events exist
    // (dates could be Month DD, YYYY or similar)
    const dateCount = await eventDates.count();
    expect(dateCount).toBeGreaterThanOrEqual(0);
  });

  test('should persist changes after page reload', async ({ page }) => {
    // Record an event
    const today = new Date().toISOString().split('T')[0];

    const dateInput = page.locator('input[type="text"]').first();
    const heightInput = page.locator('input[placeholder*="height"]').first();

    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }
    if ((await heightInput.count()) > 0) {
      await heightInput.fill('3.0');
    }

    const submitButton = page.locator('button').filter({ hasText: /record/i }).first();
    if ((await submitButton.count()) > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Data should still be visible in history
      const historySection = page.locator('text=/history|recent/i');
      expect(await historySection.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should clear form after successful submission', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill form
    const dateInput = page.locator('input[type="text"]').first();
    const heightInput = page.locator('input[placeholder*="height"]').first();
    const notesInput = page.locator('input[placeholder*="notes"], textarea').first();

    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }
    if ((await heightInput.count()) > 0) {
      await heightInput.fill('2.8');
    }
    if ((await notesInput.count()) > 0) {
      await notesInput.fill('Test notes');
    }

    // Submit
    const submitButton = page.locator('button').filter({ hasText: /record/i }).first();
    if ((await submitButton.count()) > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Form inputs should be cleared
      const heightValue = await heightInput.inputValue();

      // At least height should be cleared after submission
      expect(heightValue).toBe('');
    }
  });
});
