# LawnBudAI TODO - Current Sprint

**Last Updated**: February 22, 2026

---

## 🎯 Current Focus: Professional Form Validation & E2E Testing

Our Playwright tests revealed that pages don't work correctly because:
1. No real-time form validation
2. Submit buttons always enabled (even with invalid data)
3. Errors shown as alerts instead of inline messages
4. No testing framework for reproducible quality

**Solution**: Implement Formik + Yup validation → E2E tests with proper assertions → Test coverage improvements

---

## 📋 Dependency Chain

```
#39: Form Validation (BLOCKER)
  ↓
#38: Mowing E2E Tests (depends on #39)
  ↓
#37: Test Coverage Improvements (uses #38 as template)
  ↓
Production Ready
```

---

## 🔴 CRITICAL - Must Complete Before Production

### #39: Implement Professional Form Validation System (Formik + Yup)
**Status**: ⏳ NOT STARTED
**Priority**: CRITICAL
**Effort**: 7-8 hours
**Blocks**: #38, #37

**Why**: Current forms have no real-time validation. Submit buttons always work even with bad data.

**Phases**:
- [ ] **Phase 1** (2-3h): Setup Formik + Yup, create validation schemas
  - Install `formik` and `yup`
  - Create `schemas/mowingSchema.ts`
  - Create `schemas/wateringSchema.ts`
  - Create `schemas/fertilizerSchema.ts`
  - Create `FormikInput` component for inline errors

- [ ] **Phase 2** (1.5h): Integrate Mowing Screen
  - Refactor MowingScreen.tsx to use Formik
  - Real-time validation on blur
  - Button disabled when form invalid
  - Inline error messages on fields
  - Remove Alert dialogs for validation errors

- [ ] **Phase 3** (2h): Integrate Watering & Fertilizer Screens
  - Refactor WateringScreen.tsx
  - Refactor FertilizerScreen.tsx
  - Same pattern as Mowing

- [ ] **Phase 4** (2-3h): E2E Test Updates
  - Update Playwright tests for Formik validation
  - Verify inline errors appear on blur
  - Verify button disabled/enabled state
  - All tests passing

**GitHub Issue**: https://github.com/HaulinLogs/LawnBudAI/issues/39

---

### #38: Mowing Screen E2E Tests (Proper Assertions)
**Status**: ⏳ NOT STARTED
**Priority**: CRITICAL
**Effort**: 3-4 hours
**Depends On**: #39 (Form Validation)
**Blocks**: #37

**Why**: Current tests are fake (assertions that always pass). Need real tests that:
- Fail when feature is broken
- Pass when feature works
- Show validation working properly

**Test Cases** (13 total):
- [ ] TEST 1: Happy path - record valid event
- [ ] TEST 2: Validation - empty height (button disabled)
- [ ] TEST 3: Validation - non-numeric height
- [ ] TEST 4: Validation - zero height
- [ ] TEST 5: Validation - negative height
- [ ] TEST 6: Add notes with event
- [ ] TEST 7: Delete event with confirmation
- [ ] TEST 8: Cancel delete operation
- [ ] TEST 9: Statistics display (multiple events)
- [ ] TEST 10: Empty state (no events)
- [ ] TEST 11: Loading state
- [ ] TEST 12: API error handling (network failure)
- [ ] TEST 13: Multiple submissions in sequence

**Implementation**:
- [ ] Create `e2e/playwright/mowing-events.test.ts` (rewrite from scratch)
- [ ] Each test shows:
  - Clear preconditions
  - Specific user actions
  - Expected results (not vague)
  - Specific assertions that fail when broken
- [ ] Validation step: Run each test, show it FAILS when feature broken, PASSES when working
- [ ] All 13 tests passing

**Reference**: `/docs/mowing_playwright.md`
**GitHub Issue**: https://github.com/HaulinLogs/LawnBudAI/issues/38 (to create)

---

### #37: Systematic Test Coverage Improvement - Target 70% Threshold
**Status**: ⏳ NOT STARTED (Research Done)
**Priority**: HIGH
**Effort**: 20-25 hours (phases)
**Depends On**: #38 (uses Mowing as template)

**Current Coverage**: 28.35% (need 70%)

**Module Breakdown** (Priority Order):

#### Phase 1: Quick Wins (3 hours)
- [ ] Fertilizing module: 95.89% → 100% (finish line 150)
- [ ] Core utilities: 95.83% → 100% (validation.ts edge cases)
- [ ] User role: 76.66% → 100% (useRole.ts lines 17-19, 35-40)
- **Expected gain**: +10-12%

#### Phase 2: Core Features (14-16 hours) - REQUIRED FOR MVP
- [ ] Authentication: 0% → 70% (useSupabaseUser, useAuth) - 6-8 hours
- [ ] Mowing: 0% → 70% (useMowEvents, MowingScreen) - 4-6 hours
- [ ] Watering: 0% → 70% (useWaterEvents, WateringScreen) - 4-6 hours
- **Expected gain**: +25-30%

#### Phase 3: User Experience (9-12 hours) - NICE TO HAVE
- [ ] User Preferences: 0% → 70% - 3-4 hours
- [ ] UI Components: 0% → 40% - 6-8 hours
- **Expected gain**: +15-20%

**GitHub Issue**: https://github.com/HaulinLogs/LawnBudAI/issues/37

---

## 🟡 HIGH - Important but Not Blocking

### Quality Gate: Coverage Threshold
**Status**: ⏳ BLOCKED (by #37)
**Current**: 28.35% (threshold 70%)
**Blocks**: Production deployment

**When fixed**: `yarn quality-gates` will pass with:
- ✅ Linting: 0 errors, 0 warnings (ALREADY PASSING)
- ✅ Schema validation: passing (ALREADY PASSING)
- ✅ Unit tests: 116+ passing (ALREADY PASSING)
- ✅ Coverage: 70%+ threshold (BLOCKED by #37)

---

## ✅ DONE - Already Completed

### #36: Comprehensive Testing Strategy - Phase 1-7 Implementation
**Status**: ✅ COMPLETE
**Completed**: February 22, 2026

**What was done**:
- ✅ Phase 1: Schema validation tests created
- ✅ Phase 2: Type generation from database planned
- ✅ Phase 3: Integration tests structure created
- ✅ Phase 4: GitHub Actions CI/CD pipeline defined
- ✅ Phase 5: Error messages structured for AI parsing
- ✅ Phase 6: Failing tests fixed (4 tests in useFertilizerEvents)
- ✅ Phase 7: Documentation (TESTING_STRATEGY.md) created
- ✅ Linting: All 7 remaining warnings fixed (0 errors, 0 warnings)
- ✅ All changes committed and pushed to main

**GitHub Issue**: https://github.com/HaulinLogs/LawnBudAI/issues/36

---

## 🗂️ Files & Documentation

### Test Documentation
- `/docs/mowing_playwright.md` - 13 test cases with proper assertions
- `/docs/TESTING_STRATEGY.md` - Overall testing approach
- `/TDD.md` - Test-driven development workflow

### Key Files to Watch
- `screens/MowingScreen.tsx` - Will be refactored with Formik
- `screens/WateringScreen.tsx` - Will be refactored with Formik
- `screens/FertilizerScreen.tsx` - Will be refactored with Formik
- `lib/validation.ts` - Current validation (will be replaced with Yup schemas)
- `e2e/playwright/mowing-events.spec.ts` - Will be rewritten with proper tests

---

## 📊 Progress Summary

| Phase | Status | Issues | Key Blocker |
|-------|--------|--------|------------|
| Testing Strategy | ✅ DONE | #36 | None |
| Linting Cleanup | ✅ DONE | #36 | None |
| **Form Validation** | ⏳ TODO | #39 | None - START HERE |
| **Mowing E2E Tests** | ⏳ TODO | #38 | Blocked by #39 |
| **Test Coverage** | ⏳ TODO | #37 | Blocked by #38 |
| Production Ready | 🔴 BLOCKED | - | Need 70% coverage |

---

## 🚀 Next Steps (In Order)

### Today/Tomorrow
1. **Create GitHub Issue #38** for Mowing E2E Tests
   - Reference `/docs/mowing_playwright.md`
   - Break into 13 subtasks (one per test)
   - Link to issue #39 as dependency

2. **Start Issue #39** (Form Validation)
   - Phase 1: Install dependencies, create schemas
   - This unblocks #38

### This Week
3. **Complete Issue #39** (Form Validation)
   - Phases 1-2: Mowing screen complete & tested

4. **Start Issue #38** (Mowing E2E Tests)
   - Write proper Playwright tests
   - Show tests fail when feature broken, pass when working

### Next Week
5. **Complete Issues #38 & #39** fully
6. **Start Issue #37** (Coverage improvements)
7. **Use Mowing as template** for Watering & Fertilizer

---

## 💡 Key Principles

- ✅ **No Fake Tests**: Every test must fail when feature is broken
- ✅ **Real UX**: Validation inline on fields, no alerts for success
- ✅ **Professional Forms**: Using Formik + Yup (industry standard)
- ✅ **Incremental**: Mowing → Watering → Fertilizer (not all at once)
- ✅ **Testable**: Each feature has proper E2E tests before coverage work

---

## 📞 Questions?

- Why is #39 blocking #38? Because we need Formik validation FIRST before we can test it properly
- Why start with Mowing? It's the simplest feature to use as a template
- Can we do #37 without #38? No - we need proper E2E tests to define what we're testing
- When will production be ready? After #37 completes (70% coverage)

