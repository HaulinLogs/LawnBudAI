# E2E Test Failure Matrix

## Summary Statistics
- **Total Tests:** 175
- **Passing:** 161 (92%)
- **Failing:** 14 (8%)
- **Unique Failing Tests:** 3
- **Test Duration:** 2.2 minutes

---

## Failure Matrix

### Unique Test Failures vs Browsers

| Test | Line | Chromium | Firefox | WebKit | Mobile Chrome | Mobile Safari | Total |
|------|------|----------|---------|--------|---------------|---------------|-------|
| **mow-events.spec.ts:24** "should display the mowing form" | 24-34 | ✗ | ✗ | ✗ | ✗ | ✗ | **5/5** |
| **water-events.spec.ts:24** "should display the watering form" | 24-34 | ✗ | ✗ | ✗ | ✗ | ✗ | **5/5** |
| **navigation.spec.ts:27** "should not have broken links" | 27-41 | ✗ | ✓ | ✗ | ✗ | ✗ | **4/5** |

**Total Failures: 14 (across 5 browsers and 3 unique tests)**

---

## Failure #1: Mowing Form Not Displayed

**Test File:** `e2e/playwright/mow-events.spec.ts`
**Test Name:** "should display the mowing form"
**Line:** 24-34
**Failing Browsers:** All 5 (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)

### Error Details

```
Error: expect(received).toBeGreaterThan(expected)
Expected: > 0
Received: 0
At: mow-events.spec.ts:31:37
```

### What Was Being Tested

The test verifies form elements are present on the mowing tab:
1. Date input field
2. Height input field  
3. Submit button

### Selectors Used

```javascript
const dateInput = page.locator('input[type="text"], input[placeholder*="YYYY"]').first();
const heightInput = page.locator('input[placeholder*="height"], input[placeholder*="2.5"]').first();
const submitButton = page.locator('button').filter({ hasText: /record|submit|save/i }).first();

expect(await dateInput.count()).toBeGreaterThan(0);      // FAILED: count = 0
expect(await heightInput.count()).toBeGreaterThan(0);    // FAILED: count = 0
expect(await submitButton.count()).toBeGreaterThan(0);   // FAILED: count = 0
```

### Root Cause

Form elements are not being found. Possible reasons:
- Form not rendering on mowing tab
- Tab navigation failing
- Selectors don't match actual HTML
- Elements hidden with CSS

---

## Failure #2: Watering Form Not Displayed

**Test File:** `e2e/playwright/water-events.spec.ts`
**Test Name:** "should display the watering form"
**Line:** 24-34
**Failing Browsers:** All 5 (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)

### Error Details

```
Error: expect(received).toBeGreaterThan(expected)
Expected: > 0
Received: 0
At: water-events.spec.ts:31:37
```

### What Was Being Tested

The test verifies form elements are present on the watering tab:
1. Date input field
2. Amount input field
3. Submit button

### Selectors Used

```javascript
const dateInput = page.locator('input[type="text"], input[placeholder*="YYYY"]').first();
const amountInput = page.locator('input[placeholder*="gallons"], input[placeholder*="25"]').first();
const submitButton = page.locator('button').filter({ hasText: /record|submit|save/i }).first();

expect(await dateInput.count()).toBeGreaterThan(0);     // FAILED: count = 0
expect(await amountInput.count()).toBeGreaterThan(0);   // FAILED: count = 0
expect(await submitButton.count()).toBeGreaterThan(0);  // FAILED: count = 0
```

### Root Cause

Form elements are not being found. Possible reasons:
- Form not rendering on watering tab
- Tab navigation failing
- Selectors don't match actual HTML
- Elements hidden with CSS

---

## Failure #3: Console Errors During Navigation

**Test File:** `e2e/playwright/navigation.spec.ts`
**Test Name:** "should not have broken links in navigation"
**Line:** 27-41
**Failing Browsers:** 4/5 (Chromium, WebKit, Mobile Chrome, Mobile Safari)
**Passing Browsers:** 1/5 (Firefox)

### Error Details - Chromium & Mobile Chrome
```
Error: expect(received).toBe(expected)
Expected: 0
Received: 2

At: navigation.spec.ts:41:72
```
**Console Error Count:** 2 errors detected

### Error Details - WebKit & Mobile Safari
```
Error: expect(received).toBe(expected)
Expected: 0
Received: 1

At: navigation.spec.ts:41:72
```
**Console Error Count:** 1 error detected

### What Was Being Tested

The test checks for JavaScript errors in the console during navigation:

```javascript
let consoleErrors: string[] = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});

await page.goto('/');
await page.waitForLoadState('networkidle');

// Should not have errors in console
expect(consoleErrors.filter((e) => !e.includes('warning')).length).toBe(0);
// FAILED: Expected 0 errors, but got 1-2 errors
```

### Browser Breakdown

| Browser | Error Count | Status |
|---------|------------|--------|
| Chromium | 2 | FAILING |
| Firefox | 0 | PASSING ✓ |
| WebKit | 1 | FAILING |
| Mobile Chrome | 2 | FAILING |
| Mobile Safari | 1 | FAILING |

### Root Cause

Unhandled JavaScript errors occurring during page navigation. Error messages not captured in test output. Possible causes:
- Missing dependencies or resources
- Runtime exceptions in app code
- Supabase initialization errors
- Null/undefined reference errors
- Library incompatibilities

---

## Impact Analysis

### By Severity

**CRITICAL (Blocks Testing):**
- Mowing form not displaying (5 browsers affected)
- Watering form not displaying (5 browsers affected)

**HIGH (Stability Concern):**
- Console errors during navigation (4 browsers affected)

### By Feature Area

**Form Rendering (8 failures):**
- Mowing screen form
- Watering screen form

**Navigation/Stability (6 failures):**
- Page navigation error handling
- Console error detection

### By Browser Compatibility

| Browser | Failures | Passing | Pass Rate |
|---------|----------|---------|-----------|
| Chromium | 3 | 32 | 91.4% |
| Firefox | 2 | 33 | 94.3% |
| WebKit | 3 | 32 | 91.4% |
| Mobile Chrome | 3 | 32 | 91.4% |
| Mobile Safari | 3 | 32 | 91.4% |

---

## Passing Tests Context

Despite the 3 failing tests, most related tests are PASSING:

### Mowing Events (7/8 passing per browser)
✓ Validate required fields before submission
✓ Record a mowing event successfully
✓ Display mowing events in history
✓ Display statistics when events exist
✓ Handle delete operations on events
✓ Not crash when submitting invalid heights

### Watering Events (7/8 passing per browser)
✓ Validate required fields before submission
✓ Record a watering event successfully
✓ Display watering events in history
✓ Display source breakdown visualization
✓ Display statistics when events exist
✓ Handle delete operations on events

### Authentication (6/6 passing - 100%)
✓ Display sign in/sign up options
✓ Handle sign in flow
✓ Navigate after auth state changes
✓ Persist across page reloads
✓ Maintain session after page reload
✓ Handle auth errors gracefully

### Navigation (2/3 passing per browser)
✓ Navigate between tabs without errors
✓ Handle rapid navigation without crashing

---

## Conclusion

The discovery phase reveals:

1. **Form Display Issue (8/14 failures)**: The core issue is that form elements on the mowing and watering screens are not being found by the test selectors. This could be due to rendering issues or selector mismatches.

2. **Navigation Errors (6/14 failures)**: There are JavaScript console errors being raised during navigation, but only Firefox avoids them completely. This suggests a browser-specific compatibility issue.

3. **Positive Note**: Authentication is working perfectly, and most feature-level tests pass (recording, deletion, statistics, validation). The problem appears to be at the form rendering/display level.

**Next Phase:** Debug the form rendering issues and identify the correct selectors for form elements.

