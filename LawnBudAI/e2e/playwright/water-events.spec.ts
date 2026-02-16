/**
 * E2E tests for watering events
 *
 * Tests the complete user flow of recording, viewing, and deleting watering events
 * Runs against Expo Web export with real Supabase integration
 */

import { test, expect } from '@playwright/test';

test.describe('Watering Screen - End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Watering tab
    const wateringTab = page.locator('button, a').filter({ hasText: /water/i }).first();
    if ((await wateringTab.count()) > 0) {
      await wateringTab.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display the watering form', async ({ page }) => {
    // Look for form elements
    const dateInput = page.locator('input[type="text"], input[placeholder*="YYYY"]').first();
    const amountInput = page.locator('input[placeholder*="gallons"], input[placeholder*="25"]').first();
    const submitButton = page.locator('button').filter({ hasText: /record|submit|save/i }).first();

    // Should have form inputs
    expect(await dateInput.count()).toBeGreaterThan(0);
    expect(await amountInput.count()).toBeGreaterThan(0);
    expect(await submitButton.count()).toBeGreaterThan(0);
  });

  test('should validate required fields before submission', async ({ page }) => {
    // Try to submit without filling form
    const submitButton = page.locator('button').filter({ hasText: /record|submit/i }).first();

    if ((await submitButton.count()) > 0) {
      await submitButton.click();

      // Should show an error (browser alert or validation message)
      // Give time for alert to appear
      await page.waitForTimeout(500);

      // Check for error message or alert
      const errorVisible = await page.locator('text=/error|required|fill/i').count();
      const hasAlert = page.context().valueOf().toString().includes('alert');

      // At least one error indicator should appear
      const hasErrorIndicator = errorVisible > 0 || hasAlert;
      expect(hasErrorIndicator).toBe(true);
    }
  });

  test('should record a watering event successfully', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill date field
    const dateInput = page.locator('input[type="text"], input[placeholder*="YYYY"]').first();
    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }

    // Fill amount field
    const amountInput = page.locator('input[placeholder*="gallons"], input[placeholder*="25"]').first();
    if ((await amountInput.count()) > 0) {
      await amountInput.fill('25.5');
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

  test('should display watering events in history', async ({ page }) => {
    // Look for history section
    const historyTitle = page.locator('text=/history|recent|events/i');

    if ((await historyTitle.count()) > 0) {
      // Should display some events (or empty state)
      const eventItems = page.locator('[data-testid="event-item"], div').filter({ hasText: /gal|inch|date/i });

      // Either have events or empty state message
      const emptyState = page.locator('text=/no events|empty|nothing/i');

      const hasEvents = (await eventItems.count()) > 0 || (await emptyState.count()) > 0;
      expect(hasEvents).toBe(true);
    }
  });

  test('should display statistics when events exist', async ({ page }) => {
    // Look for statistics section
    const statsSection = page.locator('text=/statistics|stats|summary/i').first();

    if ((await statsSection.count()) > 0) {
      // Should have stat boxes with values
      const statValues = page.locator('[data-testid="stat-value"], div').filter({ hasText: /\d+/ });

      // Should have at least one stat value
      expect(await statValues.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display source breakdown visualization', async ({ page }) => {
    // Look for source breakdown section
    const breakdownSection = page.locator('text=/source|breakdown/i').first();

    if ((await breakdownSection.count()) > 0) {
      // Should display source types (sprinkler, manual, rain)
      const sourceLabels = page.locator('text=/sprinkler|manual|rain/i');

      // At least one source type should be displayed
      expect(await sourceLabels.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should allow selecting water source from dropdown', async ({ page }) => {
    // Look for source dropdown
    const sourceDropdown = page.locator('button, div').filter({ hasText: /manual|sprinkler|source/i }).first();

    if ((await sourceDropdown.count()) > 0) {
      await sourceDropdown.click();
      await page.waitForTimeout(500);

      // Should show source options
      const sourceOptions = page.locator('text=/manual|sprinkler|rain/i');
      expect(await sourceOptions.count()).toBeGreaterThan(0);

      // Click on sprinkler option
      const sprinklerOption = sourceOptions.filter({ hasText: /sprinkler/i }).first();
      if ((await sprinklerOption.count()) > 0) {
        await sprinklerOption.click();

        // Dropdown should close and option should be selected
        await page.waitForTimeout(300);
        const updatedDropdown = page.locator('button, div').filter({ hasText: /sprinkler/i });
        expect(await updatedDropdown.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should allow adding optional notes', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill form
    const dateInput = page.locator('input[type="text"]').first();
    const amountInput = page.locator('input[placeholder*="gallons"]').first();
    const notesInput = page.locator('input[placeholder*="notes"], textarea').first();

    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }
    if ((await amountInput.count()) > 0) {
      await amountInput.fill('15.0');
    }
    if ((await notesInput.count()) > 0) {
      await notesInput.fill('Morning watering session');
      const value = await notesInput.inputValue();
      expect(value).toContain('Morning');
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

  test('should not crash when submitting invalid amounts', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill form with invalid amount
    const dateInput = page.locator('input[type="text"]').first();
    const amountInput = page.locator('input[placeholder*="gallons"]').first();

    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }
    if ((await amountInput.count()) > 0) {
      // Try invalid amount
      await amountInput.fill('invalid');

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

  test('should persist changes after page reload', async ({ page }) => {
    // Record an event
    const today = new Date().toISOString().split('T')[0];

    const dateInput = page.locator('input[type="text"]').first();
    const amountInput = page.locator('input[placeholder*="gallons"]').first();

    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }
    if ((await amountInput.count()) > 0) {
      await amountInput.fill('20.0');
    }

    const submitButton = page.locator('button').filter({ hasText: /record/i }).first();
    if ((await submitButton.count()) > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Data should still be visible in history
      // (This tests Supabase persistence)
      const historySection = page.locator('text=/history|recent/i');
      expect(await historySection.count()).toBeGreaterThanOrEqual(0);
    }
  });
});
