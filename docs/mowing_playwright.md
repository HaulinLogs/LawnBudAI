# Mowing Screen E2E Test Cases

**Assumption**: App is authenticated and on the "Mowing" tab. Tests run against Expo Web with real Supabase integration.

---

## TEST 1: Happy Path - Record Valid Mowing Event

### Preconditions
- User is authenticated
- On Mowing screen
- Database has no events for today (or events from previous days exist)

### Steps
1. Verify "Log Mowing Event" form is visible
2. Date field contains today's date (auto-filled)
3. Height field is empty
4. Notes field is empty
5. "Record Mowing" button is visible and disabled until height is entered

### User Actions
1. Enter height: `2.5`
2. Leave notes empty
3. "Record Mowing" button becomes enabled
4. Click "Record Mowing" button

### Expected Results

**Immediately after submit (no alert required)**
- Form inputs are cleared:
  - Height field is empty
  - Notes field is empty
  - Date field resets to today's date
- Submit button re-enables and is ready for next entry
- Form is ready for next entry (user can immediately submit again)

**History section updates (within 500ms)**
- New event appears at top of "Recent Events" list
- Event shows: date, height (`2.5"`), and no notes text
- Event is deletable (has delete button/icon)

**Statistics section updates (if this is first event)**
- "Days since last mow" shows: `0`
- "Avg height (in)" shows: `2.5`

### Assertions (Playwright Test)
```typescript
// 1. Form clears immediately (no alert dialog needed)
await expect(page.locator('input[placeholder*="Height"]')).toHaveValue('');

// 2. Submit button is enabled and ready
await expect(page.locator('button').filter({ hasText: /record mowing/i })).toBeEnabled();

// 3. New event appears in history
const eventItem = page.locator('text=/2.5"/).first();
await expect(eventItem).toBeVisible();

// 4. Stats update
const daysSinceMow = page.locator('text=/0.*days since/i');
await expect(daysSinceMow).toBeVisible();
```

---

## TEST 2: Validation - Empty Height Field

### Preconditions
- User is on Mowing screen
- Form is empty/default state
- Using form validation system (Formik + Yup or equivalent)

### Steps
1. Focus on Height field
2. Leave empty (or clear it)
3. Tab/blur away from field

### Expected Results

**Real-time validation (on blur)**
- Error message appears BELOW height field: "Height is required"
- Error text is red/error color
- "Record Mowing" button is DISABLED
- No submit can occur

**When entering valid height (e.g., "2.5")**
- Error message disappears
- Button becomes ENABLED immediately
- No submit needed to re-enable

### Assertions (Playwright Test)
```typescript
// 1. Height field initially empty
const heightInput = page.locator('input[placeholder*="Height"]');
await expect(heightInput).toHaveValue('');

// 2. Submit button disabled on initial load
const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });
await expect(submitBtn).toBeDisabled();

// 3. Focus and blur height field (trigger validation)
await heightInput.focus();
await heightInput.blur();

// 4. Error message appears ON THE FIELD
const errorMsg = heightInput.locator('~').filter({ hasText: /required|height/i });
await expect(errorMsg).toBeVisible();

// 5. Button still disabled
await expect(submitBtn).toBeDisabled();

// 6. Enter valid value
await heightInput.fill('2.5');

// 7. Error disappears
await expect(errorMsg).not.toBeVisible();

// 8. Button enables immediately
await expect(submitBtn).toBeEnabled();
```

---

## TEST 3: Validation - Non-numeric Height

### Preconditions
- User is on Mowing screen
- Using form validation system with real-time validation

### Steps
1. Focus on Height field
2. Type: `abc` (text)
3. Blur/tab away from field

### Expected Results

**Real-time validation feedback**
- Error message appears below Height field: "Height must be a valid number"
- Error text is red/error color
- Height field may show red border or error styling
- "Record Mowing" button is DISABLED
- Submit cannot occur

**After entering valid number**
- Error message disappears immediately
- Button becomes ENABLED

### Assertions
```typescript
const heightInput = page.locator('input[placeholder*="Height"]');
const errorMsg = heightInput.locator('~').filter({ hasText: /valid number|must be a number/i });
const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

// 1. Enter invalid text
await heightInput.fill('abc');
await heightInput.blur();

// 2. Error appears on field
await expect(errorMsg).toBeVisible();

// 3. Button disabled
await expect(submitBtn).toBeDisabled();

// 4. Fix with valid input
await heightInput.fill('2.5');

// 5. Error disappears
await expect(errorMsg).not.toBeVisible();

// 6. Button enables
await expect(submitBtn).toBeEnabled();
```

---

## TEST 4: Validation - Zero Height

### Preconditions
- User is on Mowing screen
- Real-time validation enabled

### Steps
1. Enter height: `0`
2. Blur field

### Expected Results

**Real-time validation**
- Error message appears: "Height must be a positive number"
- Button DISABLED
- Cannot submit

**After entering positive value (e.g., "2.5")**
- Error disappears
- Button ENABLED

### Assertions
```typescript
const heightInput = page.locator('input[placeholder*="Height"]');
const errorMsg = heightInput.locator('~').filter({ hasText: /positive|greater than 0/i });
const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

// 1. Enter zero
await heightInput.fill('0');
await heightInput.blur();

// 2. Error appears
await expect(errorMsg).toBeVisible();

// 3. Button disabled
await expect(submitBtn).toBeDisabled();

// 4. Fix with positive value
await heightInput.fill('2.5');

// 5. Error gone, button enabled
await expect(errorMsg).not.toBeVisible();
await expect(submitBtn).toBeEnabled();
```

---

## TEST 5: Validation - Negative Height

### Preconditions
- User is on Mowing screen
- Real-time validation enabled

### Steps
1. Enter height: `-2.5`
2. Blur field

### Expected Results

**Real-time validation**
- Error message appears: "Height must be a positive number"
- Button DISABLED
- Cannot submit

### Assertions
```typescript
const heightInput = page.locator('input[placeholder*="Height"]');
const errorMsg = heightInput.locator('~').filter({ hasText: /positive|cannot be negative/i });
const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });

// 1. Enter negative
await heightInput.fill('-2.5');
await heightInput.blur();

// 2. Error appears
await expect(errorMsg).toBeVisible();

// 3. Button disabled
await expect(submitBtn).toBeDisabled();
```

---

## TEST 6: User Can Add Notes

### Preconditions
- User is on Mowing screen
- No validation errors

### Steps
1. Date: today's date (auto-filled)
2. Height: `3.5`
3. Notes: `Cut around mailbox carefully`
4. Click "Record Mowing"

### Expected Results

**After submission**
- Form clears
- Event appears in history with notes visible

### Assertions
```typescript
// 1. Notes appear in event history
const eventNotes = page.locator('text=/Cut around mailbox carefully/i');
await expect(eventNotes).toBeVisible();

// 2. Full event details show
const eventItem = page.locator('text=/3.5"').first();
await expect(eventItem).toContainText('Cut around mailbox carefully');
```

---

## TEST 7: User Can Delete Event

### Preconditions
- At least one mowing event exists in history
- User is on Mowing screen
- Count initial events

### Steps
1. Locate event in "Recent Events" list
2. Click delete button/icon on event
3. Confirmation dialog appears: "Delete Event - Are you sure?"
4. Click "Delete" button in dialog

### Expected Results

**After deletion (no alert required)**
- Event immediately disappears from Recent Events list
- Event count decreases by 1
- Statistics update to reflect removal (if applicable)
- Dialog closes automatically
- User can delete another event immediately

### Assertions
```typescript
// 1. Count events before
const initialCount = await page.locator('[testid="mowing-event"]').count();

// 2. Delete confirmation appears
const dialog = page.locator('text=/delete event|are you sure/i');
await expect(dialog).toBeVisible();

// 3. Click delete button in dialog
await page.locator('button').filter({ hasText: /^Delete$/ }).click();

// 4. Dialog closes and event is removed
await expect(dialog).not.toBeVisible();
const newCount = await page.locator('[testid="mowing-event"]').count();
await expect(newCount).toBe(initialCount - 1);
```

---

## TEST 8: Cancel Delete Operation

### Preconditions
- At least one mowing event exists

### Steps
1. Click delete button on event
2. Confirmation dialog appears
3. Click "Cancel" button

### Expected Results

**After cancel**
- Dialog closes
- Event still appears in list
- No alert shown

### Assertions
```typescript
// 1. Dialog appears
const dialog = page.locator('text=/delete event/i');
await expect(dialog).toBeVisible();

// 2. Click cancel
await page.locator('button').filter({ hasText: /cancel/i }).click();

// 3. Dialog closes
await expect(dialog).not.toBeVisible();

// 4. Event still in list
const event = page.locator('text=/height|mowing/i').first();
await expect(event).toBeVisible();
```

---

## TEST 9: Statistics Display (Multiple Events)

### Preconditions
- At least 3 mowing events exist from different dates
- Most recent event is from today

### Expected Results

**Statistics section shows**
- "Days since last mow": `0` (for today's event)
- "Avg height (in)": Correct average of all events

### Assertions
```typescript
// 1. Days since last mow shows 0
const daysSince = page.locator('text=/0.*days since last/i');
await expect(daysSince).toBeVisible();

// 2. Verify average calculation
const avgHeight = page.locator('text=/Avg height.*\d+\.\d+/i');
await expect(avgHeight).toBeVisible();
```

---

## TEST 10: Empty State (No Events)

### Preconditions
- No mowing events exist for user
- User is on Mowing screen

### Expected Results

**History section shows**
- Empty state icon (scissors/cut icon)
- Message: "No mowing events yet"
- Statistics section NOT visible (no events to show stats for)

### Assertions
```typescript
// 1. Empty state message visible
const emptyState = page.locator('text=/no mowing events yet/i');
await expect(emptyState).toBeVisible();

// 2. Stats section hidden
const statsSection = page.locator('text=/statistics/i');
await expect(statsSection).not.toBeVisible();

// 3. Cut icon visible
const icon = page.locator('[role="img"]').filter({ hasText: /cut|scissors/i });
await expect(icon).toBeVisible();
```

---

## TEST 11: Loading State (Initial Data Fetch)

### Preconditions
- User has events in database
- First time loading Mowing screen

### Expected Results

**During load (0-2000ms)**
- Loading spinner visible
- Events list empty
- Statistics hidden

**After load completes (2000ms+)**
- Loading spinner disappears
- Events appear in history
- Statistics update

### Assertions
```typescript
// 1. Initially loading
let spinner = page.locator('[role="progressbar"], text=/loading/i');
await expect(spinner).toBeVisible({ timeout: 500 });

// 2. Data loads
await page.waitForTimeout(2000);

// 3. Spinner gone, data visible
spinner = page.locator('[role="progressbar"]');
await expect(spinner).not.toBeVisible();

const events = page.locator('[testid="mowing-event"]');
await expect(events).toHaveCount(greaterThan(0));
```

---

## TEST 12: Error Handling (API Failure on Submit)

### Preconditions
- Valid form data ready
- Network error simulated (or Supabase down)

### Expected Results

**When submit fails**
- "Record Mowing" button shows loading state temporarily (disabled)
- Error message appears (toast, inline message, or alert - TBD)
- Form is NOT cleared
- User can retry immediately

**After error**
- Button re-enables
- Form still contains data: height: 2.5
- User can click submit again to retry

### Assertions
```typescript
// 1. Fill valid form
await page.locator('input[placeholder*="Height"]').fill('2.5');

// 2. Submit button shows loading (disabled)
const submitBtn = page.locator('button').filter({ hasText: /record mowing/i });
await submitBtn.click();

// Wait for loading state
await expect(submitBtn).toBeDisabled();

// 3. Error appears (format TBD - could be toast, inline, or alert)
const errorMessage = page.locator('text=/failed|error|unable/i');
await expect(errorMessage).toBeVisible({ timeout: 3000 });

// 4. Form still has data (can retry)
await expect(page.locator('input[placeholder*="Height"]')).toHaveValue('2.5');

// 5. Button is re-enabled for retry
await expect(submitBtn).toBeEnabled({ timeout: 2000 });
```

---

## TEST 13: Form Can Be Submitted Multiple Times

### Preconditions
- User on Mowing screen

### Steps
1. Submit event 1: height 2.5
2. Dismiss alert
3. Submit event 2: height 3.0
4. Dismiss alert
5. Submit event 3: height 2.0

### Expected Results

**After each submission**
- Success alert
- Form clears
- New event appears in history
- All 3 events visible in list

### Assertions
```typescript
// After 3 submissions
const events = page.locator('[testid="mowing-event"]');
await expect(events).toHaveCount(3);

// Verify all heights present
await expect(page.locator('text=/2.5"')).toBeVisible();
await expect(page.locator('text=/3.0"')).toBeVisible();
await expect(page.locator('text=/2.0"')).toBeVisible();
```

## TEST 14: Future Date Validation

### Preconditions
- User is authenticated
- On Mowing screen
- Database has events for today (or events from previous days exist)

### Steps
1. Verify "Log Mowing Event" form is visible
2. Date field contains today's date (auto-filled)
3. Height field is empty
4. Notes field is empty
5. "Record Mowing" button is visible and disabled until height is entered

### User Actions
1. Change date to a future date (e.g., tomorrow)
2. Enter height: `2.5`
3. Leave notes empty
4. "Record Mowing" button remains disabled (cannot submit future date)

### Expected Results

**Immediately after submit (no alert required)**
- Form does NOT submit
- Error message appears near date field: "Date cannot be in the future"
- Form inputs remain unchanged (date still future, height still 2.5)
- Submit button remains DISABLED
- User must correct date to submit
  
### Assertions (Playwright Test)
```typescript
// 1. Form clears immediately (no alert dialog needed)
await expect(page.locator('input[placeholder*="Height"]')).toHaveValue('');

// 2. Submit button is enabled and ready
await expect(page.locator('button').filter({ hasText: /record mowing/i })).toBeDisabled();

const dateInput = page.locator('input[type="date"]');

// 3. Error message appears ON THE FIELD
const errorMsg = dateInput.locator('~').filter({ hasText: /future/i });
await expect(errorMsg).toBeVisible();

// 4. Button still disabled2
await expect(submitBtn).toBeDisabled();

```

---

## Summary of Test Coverage

| Test | Feature | Critical | Status |
|------|---------|----------|--------|
| 1 | Happy path submission | YES | TODO |
| 2 | Empty height validation | YES | TODO |
| 3 | Non-numeric height validation | YES | TODO |
| 4 | Zero height validation | YES | TODO |
| 5 | Negative height validation | YES | TODO |
| 6 | Notes submission | NO | TODO |
| 7 | Delete event | YES | TODO |
| 8 | Cancel delete | NO | TODO |
| 9 | Statistics calculation | YES | TODO |
| 10 | Empty state | NO | TODO |
| 11 | Loading state | NO | TODO |
| 12 | API error handling | YES | TODO |
| 13 | Multiple submissions | NO | TODO |
| 14 | Future date validation | YES | TODO |
| 15 | Same day multiple events | YES | TODO |

**Critical tests**: Must pass for production release
**Nice-to-have tests**: Improve coverage but not blockers
