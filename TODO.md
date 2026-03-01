# LawnBudAI TODO - Current Sprint

**Last Updated**: March 1, 2026

---

## 🎯 Current Focus: Test Coverage Improvement (Target 70%)

Form validation and E2E tests are complete. The final step before production readiness is raising
unit test coverage from 28.35% to 70%.

**Solution**: Write unit tests for all untested hooks and components.

---

## 📋 Dependency Chain

```
#39: Form Validation ✅ DONE
  ↓
#38: E2E Tests ✅ DONE
  ↓
#37: Test Coverage Improvements (IN PROGRESS)
  ↓
Production Ready
```

---

## ✅ DONE - Already Completed

### #39: Implement Professional Form Validation System (Formik + Yup)
**Status**: ✅ COMPLETE
**Completed**: February 2026

**What was done**:
- ✅ `formik` and `yup` installed
- ✅ `lib/schemas/mowing.schema.ts` created
- ✅ `lib/schemas/watering.schema.ts` created
- ✅ `lib/schemas/fertilizer.schema.ts` created
- ✅ `components/forms/FormikEventForm.tsx` created (inline errors, disabled button)
- ✅ `components/forms/FormikNPKInput.tsx` created
- ✅ `MowingScreen.tsx` refactored to use Formik + mowingEventSchema
- ✅ `WateringScreen.tsx` refactored to use Formik + wateringEventSchema
- ✅ `FertilizerScreen.tsx` refactored to use Formik + fertilizerEventSchema

**GitHub Issue**: https://github.com/HaulinLogs/LawnBudAI/issues/39

---

### #38: E2E Tests (Mowing + All Screens)
**Status**: ✅ COMPLETE
**Completed**: February 2026

**What was done**:
- ✅ `e2e/playwright/mow-events.spec.ts` — 15 test cases
- ✅ `e2e/playwright/watering-events.spec.ts`
- ✅ `e2e/playwright/fertilizer-events.spec.ts`
- ✅ `e2e/playwright/auth.spec.ts`
- ✅ `e2e/playwright/navigation.spec.ts`
- ✅ `e2e/playwright/settings.spec.ts`
- ✅ `e2e/playwright/home-screen.spec.ts`
- ✅ `e2e/playwright/integration.spec.ts`

**GitHub Issue**: https://github.com/HaulinLogs/LawnBudAI/issues/38

---

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

## 🔴 CRITICAL - Must Complete Before Production

### #37: Systematic Test Coverage Improvement - Target 70% Threshold
**Status**: ⏳ IN PROGRESS
**Priority**: CRITICAL
**Effort**: 20-25 hours (phases)

**Current Coverage**: 28.35% (need 70%)

Coverage scope: `lib/**`, `hooks/**`, `components/**` (screens are not counted)

#### Phase 1: Quick Wins (3 hours) — patch existing tests
- [ ] `useFertilizerEvents.test.ts` — add null `application_method` branch test
- [ ] `lib/validation.test.ts` — add missing edge case for `validateNumberInRange` empty string
- [ ] `hooks/useRole.test.ts` — add null-data-from-DB test + exception throw test
- **Expected gain**: +5-8%

#### Phase 2: Core Hook Tests (14-16 hours) — create new files
- [ ] `__tests__/useMowEvents.test.ts` — fetchEvents, addEvent, deleteEvent, getStats
- [ ] `__tests__/useWaterEvents.test.ts` — fetchEvents, addEvent, deleteEvent, getStats, getSourceBreakdown
- [ ] `__tests__/hooks/useSupabaseUser.test.ts` — getUser, onAuthStateChange, cache, cleanup
- [ ] `__tests__/hooks/useAuth.test.ts` — signIn, signUp, signOut, session init
- **Expected gain**: +25-35%

#### Phase 3: Remaining Hooks + Components (9-12 hours) — if needed
- [ ] `__tests__/hooks/useUserPreferences.test.ts`
- [ ] `__tests__/lib/telemetry.test.ts`
- [ ] `__tests__/lib/securityMonitoring.test.ts`
- [ ] `__tests__/components/EventHistory.test.tsx`
- [ ] `__tests__/components/Statistics.test.tsx`
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

## 🗂️ Files & Documentation

### Test Documentation
- `/docs/mowing_playwright.md` - 13 test cases with proper assertions
- `/docs/TESTING_STRATEGY.md` - Overall testing approach
- `/TDD.md` - Test-driven development workflow

### Key Files to Watch
- `lib/schemas/mowing.schema.ts` - Mowing validation schema ✅
- `lib/schemas/watering.schema.ts` - Watering validation schema ✅
- `lib/schemas/fertilizer.schema.ts` - Fertilizer validation schema ✅
- `components/forms/FormikEventForm.tsx` - Reusable Formik form ✅
- `hooks/useMowEvents.ts` - needs unit tests
- `hooks/useWaterEvents.ts` - needs unit tests
- `hooks/useSupabaseUser.ts` - needs unit tests
- `hooks/useAuth.ts` - needs unit tests

---

## 📊 Progress Summary

| Phase | Status | Issues | Key Blocker |
|-------|--------|--------|------------|
| Testing Strategy | ✅ DONE | #36 | None |
| Linting Cleanup | ✅ DONE | #36 | None |
| Form Validation | ✅ DONE | #39 | None |
| E2E Tests | ✅ DONE | #38 | None |
| **Test Coverage** | ⏳ IN PROGRESS | #37 | None - START HERE |
| Production Ready | 🔴 BLOCKED | - | Need 70% coverage |

---

## 🚀 Next Steps (In Order)

1. **Patch existing tests** (Phase 1 quick wins)
2. **Create `useMowEvents.test.ts`** — follow useFertilizerEvents.test.ts pattern
3. **Create `useWaterEvents.test.ts`** — follow same pattern
4. **Create `useSupabaseUser.test.ts`** — mock getUser + onAuthStateChange
5. **Create `useAuth.test.ts`** — mock signIn/signUp/signOut
6. **Run `yarn test --coverage`** and check if ≥70%
7. **Add Phase 3 tests** if still below 70%
8. **Run `yarn quality-gates`** to confirm passing

---

## 💡 Key Principles

- ✅ **No Fake Tests**: Every test must fail when feature is broken
- ✅ **Real UX**: Validation inline on fields, no alerts for success
- ✅ **Professional Forms**: Using Formik + Yup (industry standard)
- ✅ **Incremental**: Mowing → Watering → Fertilizer (not all at once)
- ✅ **Testable**: Each feature has proper E2E tests before coverage work
