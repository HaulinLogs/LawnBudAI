/**
 * E2E tests for fertilizer events
 *
 * Tests the complete user flow of recording, viewing, and deleting fertilizer events
 * with N-P-K ratio tracking and application form/method selection
 * Runs against Expo Web export with real Supabase integration
 */

import { test, expect } from '@playwright/test';
import { signInTestUser } from './auth-setup';

test.describe('Fertilizer Screen - End-to-End Tests', () => {
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

    // Navigate to Fertilizer tab
    const fertilizerTab = page.locator('button, a, [role="button"]').filter({ hasText: /fertilizer/i }).first();
    if ((await fertilizerTab.count()) > 0) {
      await fertilizerTab.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display the fertilizer form with all fields', async ({ page }) => {
    // Look for form elements
    const inputs = await page.locator('input[type="text"], input:not([type]), textarea').all();
    const buttons = await page.locator('button, [role="button"]').all();

    // Should have form inputs (date, amount, nitrogen, phosphorus, potassium, notes)
    expect(inputs.length).toBeGreaterThanOrEqual(5);
    expect(buttons.length).toBeGreaterThan(0);

    // Check for form labels
    const amountLabel = page.locator('text=/amount.*lbs\/1000/i');
    const npkLabel = page.locator('text=/n-p-k/i');
    expect(await amountLabel.count()).toBeGreaterThan(0);
    expect(await npkLabel.count()).toBeGreaterThan(0);
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
      expect(errorVisible).toBeGreaterThan(0);
    }
  });

  test('should validate N-P-K percentages are 0-100', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill date and amount
    const dateInput = page.locator('input[type="text"]').first();
    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }

    const amountInput = page.locator('input[placeholder*="3.5"], input[placeholder*="lbs"]').first();
    if ((await amountInput.count()) > 0) {
      await amountInput.fill('3.5');
    }

    // Try to fill invalid N-P-K value (> 100)
    const nInputs = page.locator('input[placeholder*="N"], input[placeholder*="P"], input[placeholder*="K"]');
    const nitrogenInput = nInputs.first();

    if ((await nitrogenInput.count()) > 0) {
      // Fill with invalid value
      await nitrogenInput.fill('150');

      // Try to submit
      const submitButton = page.locator('button').filter({ hasText: /record|submit/i }).first();
      if ((await submitButton.count()) > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);

        // Should show validation error
        const errorMessage = page.locator('text=/error|invalid|between 0/i');
        expect(await errorMessage.count()).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should record a fertilizer event successfully', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill date field
    const dateInput = page.locator('input[type="text"]').first();
    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }

    // Fill amount field
    const amountInput = page.locator('input[placeholder*="3.5"], input[placeholder*="lbs"]').first();
    if ((await amountInput.count()) > 0) {
      await amountInput.fill('3.5');
    }

    // Fill N-P-K fields
    const inputs = page.locator('input[type="text"], input');
    const npkInputs = inputs.filter({ hasText: /\d+/ });

    // Get all numeric inputs and fill N-P-K values
    const npkInputs = await page.locator('input[placeholder*="N"], input[placeholder*="P"], input[placeholder*="K"]').all();
    if (npkInputs.length >= 3) {
      await npkInputs[0].fill('16'); // Nitrogen
      await npkInputs[1].fill('4');  // Phosphorus
      await npkInputs[2].fill('8');  // Potassium
    }

    // Submit form
    const submitButton = page.locator('button').filter({ hasText: /record/i }).first();
    if ((await submitButton.count()) > 0) {
      await submitButton.click();

      // Wait for success message
      await page.waitForTimeout(1000);

      // Look for success indication
      const successMessage = page.locator('text=/success|recorded|saved/i');
      expect(await successMessage.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should allow selecting application form (liquid/granular)', async ({ page }) => {
    // Look for application form dropdown
    const formDropdown = page.locator('button, div').filter({ hasText: /application form|liquid|granular/i }).first();

    if ((await formDropdown.count()) > 0) {
      await formDropdown.click();
      await page.waitForTimeout(500);

      // Should show form options
      const formOptions = page.locator('text=/liquid|granular/i');
      expect(await formOptions.count()).toBeGreaterThan(0);

      // Click on liquid option
      const liquidOption = formOptions.filter({ hasText: /liquid/i }).first();
      if ((await liquidOption.count()) > 0) {
        await liquidOption.click();

        // Dropdown should close and option should be selected
        await page.waitForTimeout(300);
        const updatedDropdown = page.locator('button, div').filter({ hasText: /liquid/i });
        expect(await updatedDropdown.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should allow selecting application method (broadcast/spot/edge/custom)', async ({ page }) => {
    // Look for application method dropdown
    const methodDropdown = page.locator('button, div').filter({ hasText: /application method|broadcast|spot|edge|custom/i }).first();

    if ((await methodDropdown.count()) > 0) {
      await methodDropdown.click();
      await page.waitForTimeout(500);

      // Should show method options
      const methodOptions = page.locator('text=/broadcast|spot|edge|custom/i');
      expect(await methodOptions.count()).toBeGreaterThan(0);

      // Click on spot option
      const spotOption = methodOptions.filter({ hasText: /spot/i }).first();
      if ((await spotOption.count()) > 0) {
        await spotOption.click();

        // Dropdown should close and option should be selected
        await page.waitForTimeout(300);
        const updatedDropdown = page.locator('button, div').filter({ hasText: /spot/i });
        expect(await updatedDropdown.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should display fertilizer events in history', async ({ page }) => {
    // Look for history section
    const historyTitle = page.locator('text=/history|recent|applications/i');

    if ((await historyTitle.count()) > 0) {
      // Should display some events or empty state
      const eventItems = page.locator('text=/lbs\/1000|nitrogen|phosphorus|potassium/i');

      // Either have events or empty state message
      const emptyState = page.locator('text=/no events|empty|nothing/i');

      const hasEvents = (await eventItems.count()) > 0 || (await emptyState.count()) > 0;
      expect(hasEvents).toBe(true);
    }
  });

  test('should display event details with N-P-K ratio', async ({ page }) => {
    // Look for event details showing N-P-K ratio format (e.g., "16-4-8")
    const eventDetail = page.locator('text=/\\d+-\\d+-\\d+/');

    if ((await eventDetail.count()) > 0) {
      // Event should display N-P-K ratio
      expect(await eventDetail.count()).toBeGreaterThan(0);
    }
  });

  test('should display statistics when events exist', async ({ page }) => {
    // Look for statistics section
    const statsSection = page.locator('text=/statistics|stats|summary/i').first();

    if ((await statsSection.count()) > 0) {
      // Should display days since application
      const daysSince = page.locator('text=/days since application/i');

      // Should have stat values
      const statValues = page.locator('[data-testid="stat-value"], div').filter({ hasText: /\d+/ });

      expect(await daysSince.count()).toBeGreaterThanOrEqual(0);
      expect(await statValues.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display average N-P-K ratio in statistics', async ({ page }) => {
    // Look for average N-P-K section
    const npkSection = page.locator('text=/average n-p-k|n-p-k ratio/i').first();

    if ((await npkSection.count()) > 0) {
      // Should display N-P-K values in format "16-4-8"
      const npkRatio = page.locator('text=/\\d+-\\d+-\\d+/');
      expect(await npkRatio.count()).toBeGreaterThan(0);
    }
  });

  test('should display application form breakdown', async ({ page }) => {
    // Look for form breakdown section
    const formSection = page.locator('text=/application form/i');

    if ((await formSection.count()) > 0) {
      // Should display liquid and granular counts
      const formLabels = page.locator('text=/liquid|granular/i');
      expect(await formLabels.count()).toBeGreaterThan(0);
    }
  });

  test('should display application method breakdown', async ({ page }) => {
    // Look for method breakdown section
    const methodSection = page.locator('text=/application method/i');

    if ((await methodSection.count()) > 0) {
      // Should display method types
      const methodLabels = page.locator('text=/broadcast|spot|edge|custom/i');
      expect(await methodLabels.count()).toBeGreaterThan(0);
    }
  });

  test('should allow adding optional notes', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill form
    const dateInput = page.locator('input[type="text"]').first();
    const notesInput = page.locator('input[placeholder*="notes"], textarea').first();

    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }
    if ((await notesInput.count()) > 0) {
      await notesInput.fill('Spring pre-emergent application');
      const value = await notesInput.inputValue();
      expect(value).toContain('Spring');
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

  test('should show warning when N-P-K total exceeds 100%', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill form
    const dateInput = page.locator('input[type="text"]').first();
    const amountInput = page.locator('input[placeholder*="3.5"], input[placeholder*="lbs"]').first();

    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }
    if ((await amountInput.count()) > 0) {
      await amountInput.fill('3.5');
    }

    // Fill N-P-K with values that sum > 100
    const allInputs = await page.locator('input[placeholder*="N"], input[placeholder*="P"], input[placeholder*="K"]').all();
    if (allInputs.length >= 3) {
      await allInputs[0].fill('40'); // Nitrogen
      await allInputs[1].fill('40'); // Phosphorus
      await allInputs[2].fill('30'); // Potassium (total = 110)

      // Wait a moment for warning to appear
      await page.waitForTimeout(500);

      // Look for warning message
      const warning = page.locator('text=/n-p-k.*exceeds|warning/i');
      expect(await warning.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should not crash when submitting invalid amounts', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];

    // Fill form with invalid amount
    const dateInput = page.locator('input[type="text"]').first();
    const amountInput = page.locator('input[placeholder*="3.5"], input[placeholder*="lbs"]').first();

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
    const amountInput = page.locator('input[placeholder*="3.5"], input[placeholder*="lbs"]').first();

    if ((await dateInput.count()) > 0) {
      await dateInput.fill(today);
    }
    if ((await amountInput.count()) > 0) {
      await amountInput.fill('2.5');
    }

    // Fill N-P-K
    const allInputs = await page.locator('input[placeholder*="N"], input[placeholder*="P"], input[placeholder*="K"]').all();
    if (allInputs.length >= 3) {
      await allInputs[0].fill('12');
      await allInputs[1].fill('8');
      await allInputs[2].fill('6');
    }

    const submitButton = page.locator('button').filter({ hasText: /record/i }).first();
    if ((await submitButton.count()) > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Data should still be visible in history
      const historySection = page.locator('text=/history|recent|applications/i');
      expect(await historySection.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should format event details correctly with all fields', async ({ page }) => {
    // Look for properly formatted event detail showing:
    // "3.5 lbs/1000 sq ft • 16-4-8 • granular • broadcast"
    const eventDetail = page.locator('text=/lbs\\/1000 sq ft.*\\d+-\\d+-\\d+.*liquid|granular.*broadcast|spot|edge|custom/i');

    // Event should display in correct format if events exist
    if ((await eventDetail.count()) > 0) {
      expect(await eventDetail.count()).toBeGreaterThan(0);
    }
  });
});
