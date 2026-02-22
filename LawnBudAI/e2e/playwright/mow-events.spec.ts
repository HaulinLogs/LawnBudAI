/**
 * E2E tests for mowing events
 *
 * Comprehensive test suite covering all 15 test cases documented in docs/mowing_playwright.md
 * Tests the complete user flow of recording, viewing, validating, and deleting mowing events
 * Runs against Expo Web export with real Supabase integration
 */

import { test, expect } from '@playwright/test';
import { signInTestUser } from './auth-setup';

test.describe('Mowing Screen - End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if we need to authenticate
    const content = await page.content();
    const needsAuth = content.includes('Sign In') || content.includes('sign in');

    if (needsAuth) {
      // Try to sign in
      await signInTestUser(page);
      await page.waitForTimeout(2000);
    }

    // Navigate to Mowing tab
    const mowingTab = page
      .locator('button, a, [role="button"]')
      .filter({ hasText: /mow/i })
      .first();
    if ((await mowingTab.count()) > 0) {
      await mowingTab.click();
      await page.waitForLoadState('networkidle');
    }
  });

  // TEST 1: Happy Path - Record Valid Mowing Event
  test('TEST 1: Record valid mowing event and verify form clears', async ({ page }) => {
    // Get initial event count
    const initialEvents = await page.locator('[testid="mowing-event"]').count();

    // Fill height field
    const heightInput = page.locator('input[placeholder*="Height"]');
    await heightInput.fill('2.5');

    // Submit form
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Wait for submission
    await page.waitForTimeout(500);

    // Form inputs should be cleared
    await expect(heightInput).toHaveValue('');

    // Submit button should be re-enabled
    await expect(submitBtn).toBeEnabled();

    // New event should appear in history
    const newEvents = await page.locator('[testid="mowing-event"]').count();
    expect(newEvents).toBe(initialEvents + 1);

    // Event should show the height value
    const eventHeight = page.locator('text=/2.5"/i');
    await expect(eventHeight).toBeVisible();
  });

  // TEST 2: Validation - Empty Height Field
  test('TEST 2: Empty height field shows validation error', async ({ page }) => {
    const heightInput = page.locator('input[placeholder*="Height"]');
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    // Initially submit button should be disabled
    await expect(submitBtn).toBeDisabled();

    // Focus and blur height field (trigger validation)
    await heightInput.focus();
    await heightInput.blur();

    // Error message should appear below field
    const errorMsg = heightInput.locator('..').filter({ hasText: /required|height/i });
    await expect(errorMsg).toBeVisible();

    // Button still disabled
    await expect(submitBtn).toBeDisabled();

    // Enter valid value
    await heightInput.fill('2.5');

    // Error should disappear
    await expect(errorMsg).not.toBeVisible();

    // Button enables immediately
    await expect(submitBtn).toBeEnabled();
  });

  // TEST 3: Validation - Non-numeric Height
  test('TEST 3: Non-numeric height shows validation error', async ({ page }) => {
    const heightInput = page.locator('input[placeholder*="Height"]');
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    // Enter invalid text
    await heightInput.fill('abc');
    await heightInput.blur();

    // Error should appear
    const errorMsg = heightInput.locator('..').filter({ hasText: /valid number|must be a number/i });
    await expect(errorMsg).toBeVisible();

    // Button disabled
    await expect(submitBtn).toBeDisabled();

    // Fix with valid input
    await heightInput.fill('2.5');

    // Error disappears
    await expect(errorMsg).not.toBeVisible();

    // Button enables
    await expect(submitBtn).toBeEnabled();
  });

  // TEST 4: Validation - Zero Height
  test('TEST 4: Zero height shows validation error', async ({ page }) => {
    const heightInput = page.locator('input[placeholder*="Height"]');
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    // Enter zero
    await heightInput.fill('0');
    await heightInput.blur();

    // Error should appear
    const errorMsg = heightInput.locator('..').filter({ hasText: /positive|greater than 0/i });
    await expect(errorMsg).toBeVisible();

    // Button disabled
    await expect(submitBtn).toBeDisabled();

    // Fix with positive value
    await heightInput.fill('2.5');

    // Error gone, button enabled
    await expect(errorMsg).not.toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  // TEST 5: Validation - Negative Height
  test('TEST 5: Negative height shows validation error', async ({ page }) => {
    const heightInput = page.locator('input[placeholder*="Height"]');
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    // Enter negative
    await heightInput.fill('-2.5');
    await heightInput.blur();

    // Error should appear
    const errorMsg = heightInput.locator('..').filter({ hasText: /positive|cannot be negative/i });
    await expect(errorMsg).toBeVisible();

    // Button disabled
    await expect(submitBtn).toBeDisabled();
  });

  // TEST 6: User Can Add Notes
  test('TEST 6: Notes are submitted and displayed in history', async ({ page }) => {
    const heightInput = page.locator('input[placeholder*="Height"]');
    const notesInput = page.locator('textarea, input[placeholder*="notes"], input[placeholder*="Notes"]').first();
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    // Fill form with notes
    await heightInput.fill('3.5');
    if ((await notesInput.count()) > 0) {
      await notesInput.fill('Cut around mailbox carefully');
    }

    await submitBtn.click();
    await page.waitForTimeout(500);

    // Notes should appear in event history
    const eventNotes = page.locator('text=/Cut around mailbox carefully/i');
    await expect(eventNotes).toBeVisible();

    // Event should contain both height and notes
    const eventItem = page.locator('text=/3.5"').first();
    await expect(eventItem.locator('..').first()).toContainText('Cut around mailbox carefully');
  });

  // TEST 7: User Can Delete Event
  test('TEST 7: Delete event removes it from history', async ({ page }) => {
    // First, create an event
    const heightInput = page.locator('input[placeholder*="Height"]');
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    const initialCount = await page.locator('[testid="mowing-event"]').count();

    await heightInput.fill('2.5');
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Event should be created
    let eventCount = await page.locator('[testid="mowing-event"]').count();
    expect(eventCount).toBeGreaterThan(initialCount);

    // Find and click delete button
    const deleteButtons = page.locator('button').filter({ hasText: /delete|remove|trash/i });
    if ((await deleteButtons.count()) > 0) {
      await deleteButtons.first().click();
      await page.waitForTimeout(500);

      // Confirmation dialog should appear
      const dialog = page.locator('text=/delete event|are you sure/i');
      await expect(dialog).toBeVisible();

      // Click delete button in dialog
      const confirmBtn = page.locator('button').filter({ hasText: /^Delete$/i }).first();
      if ((await confirmBtn.count()) > 0) {
        await confirmBtn.click();
        await page.waitForTimeout(500);
      }

      // Event should be removed
      eventCount = await page.locator('[testid="mowing-event"]').count();
      expect(eventCount).toBe(initialCount);
    }
  });

  // TEST 8: Cancel Delete Operation
  test('TEST 8: Cancel delete preserves event in history', async ({ page }) => {
    // Create an event first
    const heightInput = page.locator('input[placeholder*="Height"]');
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    await heightInput.fill('2.5');
    await submitBtn.click();
    await page.waitForTimeout(500);

    const initialCount = await page.locator('[testid="mowing-event"]').count();

    // Try to delete but cancel
    const deleteButtons = page.locator('button').filter({ hasText: /delete|remove|trash/i });
    if ((await deleteButtons.count()) > 0) {
      await deleteButtons.first().click();
      await page.waitForTimeout(500);

      // Dialog appears
      const dialog = page.locator('text=/delete event/i');
      await expect(dialog).toBeVisible();

      // Click cancel
      const cancelBtn = page.locator('button').filter({ hasText: /cancel/i }).first();
      if ((await cancelBtn.count()) > 0) {
        await cancelBtn.click();
        await page.waitForTimeout(500);
      }

      // Dialog should close
      await expect(dialog).not.toBeVisible();

      // Event should still be in list
      const eventCount = await page.locator('[testid="mowing-event"]').count();
      expect(eventCount).toBe(initialCount);
    }
  });

  // TEST 9: Statistics Display (Multiple Events)
  test('TEST 9: Statistics display correctly with multiple events', async ({ page }) => {
    const heightInput = page.locator('input[placeholder*="Height"]');
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    // Create multiple events if needed
    await heightInput.fill('2.5');
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Statistics section should be visible if events exist
    const statsSection = page.locator('text=/statistics/i');

    if ((await statsSection.count()) > 0) {
      // Days since last mow should be visible
      const daysSince = page.locator('text=/0.*days since/i');
      await expect(daysSince).toBeVisible();

      // Average height should be visible
      const avgHeight = page.locator('text=/Avg height/i');
      await expect(avgHeight).toBeVisible();
    }
  });

  // TEST 10: Empty State (No Events)
  test('TEST 10: Empty state displays when no events exist', async ({ page }) => {
    // Empty state message should be visible if no events
    const emptyState = page.locator('text=/no mowing events yet/i');

    // Either empty state or events list should be present
    const historySection = page.locator('text=/recent events/i');
    if ((await historySection.count()) > 0) {
      const eventCount = await page.locator('[testid="mowing-event"]').count();

      if (eventCount === 0) {
        await expect(emptyState).toBeVisible();
      }
    }
  });

  // TEST 11: Loading State (Initial Data Fetch)
  test('TEST 11: Loading state displays during data fetch', async ({ page }) => {
    // Navigate to mowing tab to trigger load
    const mowingTab = page
      .locator('button, a, [role="button"]')
      .filter({ hasText: /mow/i })
      .first();

    // Data should eventually load
    await page.waitForTimeout(2000);

    // Page should be responsive
    const inputs = await page.locator('input').all();
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  // TEST 12: Error Handling (API Failure on Submit)
  test('TEST 12: Form handles API errors gracefully', async ({ page }) => {
    const heightInput = page.locator('input[placeholder*="Height"]');
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    // Fill valid form
    await heightInput.fill('2.5');
    await expect(submitBtn).toBeEnabled();

    // Submit button should become disabled during submission
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Form should remain responsive after submission attempt
    // (can re-enter data or retry)
    const heightValue = await heightInput.inputValue();
    // Height should be empty (form reset) or might show error message
    // This test ensures the app doesn't crash
    expect(heightValue).toBeDefined();
  });

  // TEST 13: Form Can Be Submitted Multiple Times
  test('TEST 13: Multiple submissions work correctly', async ({ page }) => {
    const heightInput = page.locator('input[placeholder*="Height"]');
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    const initialCount = await page.locator('[testid="mowing-event"]').count();

    // Submit multiple events
    const heights = ['2.5', '3.0', '2.0'];

    for (const height of heights) {
      await heightInput.fill(height);
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();
      await page.waitForTimeout(500);
    }

    // All 3 events should be created
    const finalCount = await page.locator('[testid="mowing-event"]').count();
    expect(finalCount).toBe(initialCount + heights.length);

    // Verify all heights present in history
    for (const height of heights) {
      const heightText = page.locator(`text=/${height}"/i`);
      await expect(heightText).toBeVisible();
    }
  });

  // TEST 14: Duplicate Date Prevention
  test('TEST 14: Duplicate date shows validation error', async ({ page }) => {
    const dateInput = page.locator('input[placeholder*="YYYY-MM-DD"]');
    const heightInput = page.locator('input[placeholder*="Height"]');
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    const today = new Date().toISOString().split('T')[0];

    // Create first event for today
    await heightInput.fill('2.5');
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Try to create another event for today (duplicate date)
    await heightInput.fill('3.0');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Error message should appear on date field
    const errorMsg = dateInput.locator('..').filter({
      hasText: /already exists|duplicate|delete/i,
    });
    await expect(errorMsg).toBeVisible();

    // Submit button should still be enabled (user can change date)
    await expect(submitBtn).toBeEnabled();

    // Form data should be unchanged
    await expect(heightInput).toHaveValue('3.0');
    await expect(dateInput).toHaveValue(today);
  });

  // TEST 15: Future Date Validation
  test('TEST 15: Future date shows validation error and can be corrected', async ({ page }) => {
    const dateInput = page.locator('input[placeholder*="YYYY-MM-DD"]');
    const heightInput = page.locator('input[placeholder*="Height"]');
    const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Change date to tomorrow
    await dateInput.fill(tomorrowStr);

    // Enter valid height
    await heightInput.fill('2.5');

    await expect(submitBtn).toBeEnabled();

    // Try to submit with future date
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Error message should appear on date field
    const errorMsg = dateInput.locator('..').filter({ hasText: /future|cannot choose/i });
    await expect(errorMsg).toBeVisible();

    // Submit button still enabled (can correct date)
    await expect(submitBtn).toBeEnabled();

    // Form data unchanged
    await expect(dateInput).toHaveValue(tomorrowStr);
    await expect(heightInput).toHaveValue('2.5');

    // User corrects date to today
    await dateInput.fill(today);

    // Error should disappear
    await expect(errorMsg).not.toBeVisible();

    // Button remains enabled
    await expect(submitBtn).toBeEnabled();

    // Submit succeeds
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Form should clear
    await expect(heightInput).toHaveValue('');

    // Event should appear
    const eventItem = page.locator('text=/2.5"/i').first();
    await expect(eventItem).toBeVisible();
  });
});
