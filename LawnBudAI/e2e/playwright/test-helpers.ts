import { Page, expect } from '@playwright/test';

/**
 * E2E Test Helpers - Reusable utilities for common test operations
 * These helpers reduce boilerplate and improve test maintainability
 */

/**
 * Navigation Helpers
 */

/**
 * Navigate to a specific tab by name
 * @param page - Playwright Page object
 * @param tabName - Name of tab (e.g., "Home", "Mowing", "Watering", "Fertilizer", "Settings")
 */
export async function navigateToTab(page: Page, tabName: string) {
  const tabButton = page.getByRole('tab', { name: new RegExp(tabName, 'i') });
  await expect(tabButton).toBeVisible();
  await tabButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to Settings tab
 */
export async function navigateToSettings(page: Page) {
  await navigateToTab(page, 'Settings');
}

/**
 * Navigate to Home tab
 */
export async function navigateToHome(page: Page) {
  await navigateToTab(page, 'Home');
}

/**
 * Navigate to Mowing tab
 */
export async function navigateToMowing(page: Page) {
  await navigateToTab(page, 'Mowing');
}

/**
 * Navigate to Watering tab
 */
export async function navigateToWatering(page: Page) {
  await navigateToTab(page, 'Watering');
}

/**
 * Navigate to Fertilizer tab
 */
export async function navigateToFertilizer(page: Page) {
  await navigateToTab(page, 'Fertilizer');
}

/**
 * Form Interaction Helpers
 */

/**
 * Fill an event form with provided data
 * @param page - Playwright Page object
 * @param data - Form data { date, amount, notes?, source?, nitrogen?, phosphorus?, potassium?, applicationForm?, applicationMethod? }
 */
export async function fillEventForm(
  page: Page,
  data: {
    date?: string;
    amount?: string;
    notes?: string;
    source?: string;
    nitrogen?: string;
    phosphorus?: string;
    potassium?: string;
    applicationForm?: string;
    applicationMethod?: string;
  },
) {
  // Fill date if provided
  if (data.date) {
    await page.getByPlaceholder(/YYYY-MM-DD/).fill(data.date);
  }

  // Fill amount/height if provided
  if (data.amount) {
    const amountInput = page.getByPlaceholder(/e\.g\.|gallons|inches|lbs/);
    await amountInput.fill(data.amount);
  }

  // Fill notes if provided
  if (data.notes) {
    await page.getByPlaceholder(/Any notes|notes/i).fill(data.notes);
  }

  // Fill source (watering) if provided
  if (data.source) {
    await selectPickerOption(page, 'Source', data.source);
  }

  // Fill N-P-K if provided (fertilizer)
  if (data.nitrogen) {
    await page.getByPlaceholder('N').fill(data.nitrogen);
  }
  if (data.phosphorus) {
    await page.getByPlaceholder('P').fill(data.phosphorus);
  }
  if (data.potassium) {
    await page.getByPlaceholder('K').fill(data.potassium);
  }

  // Fill application form if provided
  if (data.applicationForm) {
    await selectPickerOption(page, 'Application Form', data.applicationForm);
  }

  // Fill application method if provided
  if (data.applicationMethod) {
    await selectPickerOption(page, 'Application Method', data.applicationMethod);
  }
}

/**
 * Submit a form by clicking the submit button
 * @param page - Playwright Page object
 * @param buttonText - Text of the submit button (e.g., "Record Mowing")
 */
export async function submitForm(page: Page, buttonText: string = 'Record') {
  const submitButton = page.getByRole('button', { name: new RegExp(buttonText, 'i') });
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Select an option from a picker dropdown
 * @param page - Playwright Page object
 * @param pickerLabel - Label of the picker
 * @param optionLabel - Label of the option to select
 */
export async function selectPickerOption(
  page: Page,
  pickerLabel: string,
  optionLabel: string,
) {
  // Find the picker button for this label
  const pickerSection = page.locator(`text="${pickerLabel}"`).locator('..').nth(1);
  const pickerButton = pickerSection.locator('button').first();

  // Click to open picker
  await pickerButton.click();
  await page.waitForTimeout(300); // Wait for animation

  // Find and click the option
  const option = page.getByText(new RegExp(optionLabel, 'i')).nth(1);
  await option.click();
  await page.waitForTimeout(300); // Wait for animation
}

/**
 * Assertion Helpers
 */

/**
 * Expect a success message to appear
 * @param page - Playwright Page object
 * @param expectedText - Optional expected text in success message
 */
export async function expectSuccessMessage(page: Page, expectedText?: string) {
  const pattern = expectedText ? new RegExp(expectedText, 'i') : /success|recorded|saved|updated|deleted/i;
  const message = page.locator(`text="${pattern}"`);
  await expect(message).toBeVisible();
}

/**
 * Expect an error message to appear
 * @param page - Playwright Page object
 * @param expectedError - Optional expected error text
 */
export async function expectErrorMessage(page: Page, expectedError?: string) {
  const pattern = expectedError ? new RegExp(expectedError, 'i') : /error|failed/i;
  const message = page.locator(`text="${pattern}"`);
  await expect(message).toBeVisible();
}

/**
 * Event Management Helpers
 */

/**
 * Get the count of events displayed on the current screen
 * @param page - Playwright Page object
 * @returns Number of events displayed
 */
export async function getEventCount(page: Page): Promise<number> {
  // Count event items in history (look for date patterns like "Feb 21")
  const eventElements = page.locator('text=/[A-Za-z]{3} \\d{1,2}/').all();
  return eventElements.length;
}

/**
 * Delete the first event from the list
 * @param page - Playwright Page object
 */
export async function deleteFirstEvent(page: Page) {
  // Find first delete button (usually in a list of events)
  const deleteButtons = page.locator('button:has-text("Delete")');
  const firstDeleteButton = deleteButtons.first();

  await firstDeleteButton.click();

  // Confirm delete if there's a confirmation dialog
  const confirmButton = page.getByRole('button', { name: /delete|confirm/i }).last();
  if (await confirmButton.isVisible()) {
    await confirmButton.click();
  }

  await page.waitForLoadState('networkidle');
}

/**
 * Database and State Helpers
 */

/**
 * Sign out the current user
 * @param page - Playwright Page object
 */
export async function signOut(page: Page) {
  await navigateToSettings(page);
  const signOutButton = page.getByRole('button', { name: /sign out|logout/i });
  await expect(signOutButton).toBeVisible();
  await signOutButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Fill and submit user preferences on Settings
 * @param page - Playwright Page object
 * @param preferences - { city?, state?, lawnSize?, grassType? }
 */
export async function fillUserPreferences(
  page: Page,
  preferences: {
    city?: string;
    state?: string;
    lawnSize?: string;
    grassType?: string;
  },
) {
  await navigateToSettings(page);

  if (preferences.city) {
    await page.getByPlaceholder(/city/i).fill(preferences.city);
  }

  if (preferences.state) {
    await page.getByPlaceholder(/state/i).fill(preferences.state);
  }

  if (preferences.lawnSize) {
    await page.getByPlaceholder(/size|sq/i).fill(preferences.lawnSize);
  }

  if (preferences.grassType) {
    await selectPickerOption(page, 'Grass Type', preferences.grassType);
  }

  // Save preferences
  const saveButton = page.getByRole('button', { name: /save|update/i });
  if (await saveButton.isVisible()) {
    await saveButton.click();
    await page.waitForLoadState('networkidle');
  }
}

/**
 * Wait for data to load (look for loading spinner to disappear)
 * @param page - Playwright Page object
 */
export async function waitForDataLoad(page: Page) {
  const spinner = page.locator('[data-testid="loading-spinner"]');
  if (await spinner.isVisible()) {
    await expect(spinner).not.toBeVisible({ timeout: 10000 });
  }
  await page.waitForLoadState('networkidle');
}

/**
 * Take a screenshot for visual regression testing
 * @param page - Playwright Page object
 * @param name - Name of the screenshot
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
}
