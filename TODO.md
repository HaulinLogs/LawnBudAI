# LawnBudAI TODO - Current Sprint

**Last Updated**: March 4, 2026

---

## 🎯 Current Focus: lib/supabase.ts Coverage Gap

Test coverage target of 70% has been **exceeded**. Current coverage as of March 4, 2026:

| Metric | Target | Actual |
|--------|--------|--------|
| Statements | 70% | **90.99%** |
| Branches | 70% | **75%** |
| Functions | 70% | **93.9%** |
| Lines | 70% | **92.04%** |
| Tests passing | 116+ | **150** |

**Remaining gap**: `lib/supabase.ts` is at 0% coverage (lines 5–42).

---

## 📋 Dependency Chain

```
#39: Form Validation ✅ DONE
  ↓
#38: E2E Tests ✅ DONE
  ↓
#37: Test Coverage Improvements ✅ DONE (90.99% achieved)
  ↓
Production Ready ✅ (quality gates passing)
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

## ✅ COMPLETE - Test Coverage (#37)

### #37: Systematic Test Coverage Improvement - Target 70% Threshold
**Status**: ✅ COMPLETE
**Completed**: March 4, 2026

All hook tests created and coverage far exceeds the 70% target. See coverage table above.

**GitHub Issue**: https://github.com/HaulinLogs/LawnBudAI/issues/37

---

## 🟡 REMAINING - Low Priority

### Quality Gate: lib/supabase.ts Coverage
**Status**: ⚠️ MINOR GAP
**Current**: `lib/supabase.ts` at 0% (lines 5–42 uncovered)
**Impact**: Does not block production — overall coverage is 90.99%

**Quality Gates Status**:
- ✅ Linting: 0 errors, 0 warnings
- ✅ Schema validation: passing
- ✅ Unit tests: 150 passing
- ✅ Coverage: 90.99% (well above 70% threshold)

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
- `hooks/useMowEvents.ts` - unit tests ✅
- `hooks/useWaterEvents.ts` - unit tests ✅
- `hooks/useSupabaseUser.ts` - unit tests ✅
- `hooks/useAuth.ts` - unit tests ✅
- `lib/supabase.ts` - 0% coverage (minor gap, non-blocking)

---

## 📊 Progress Summary

| Phase | Status | Issues | Key Blocker |
|-------|--------|--------|------------|
| Testing Strategy | ✅ DONE | #36 | None |
| Linting Cleanup | ✅ DONE | #36 | None |
| Form Validation | ✅ DONE | #39 | None |
| E2E Tests | ✅ DONE | #38 | None |
| **Test Coverage** | ✅ DONE | #37 | None (90.99% achieved) |
| Production Ready | ✅ READY | - | None |

---

## 🚀 Next Steps (In Order)

1. ✅ ~~Patch existing tests~~ — done
2. ✅ ~~Create hook test files~~ — all hooks have tests
3. ✅ ~~Run `yarn test --coverage`~~ — 90.99% achieved
4. **Optional**: Add tests for `lib/supabase.ts` (0% coverage, non-blocking)

---

## 💡 Key Principles

- ✅ **No Fake Tests**: Every test must fail when feature is broken
- ✅ **Real UX**: Validation inline on fields, no alerts for success
- ✅ **Professional Forms**: Using Formik + Yup (industry standard)
- ✅ **Incremental**: Mowing → Watering → Fertilizer (not all at once)
- ✅ **Testable**: Each feature has proper E2E tests before coverage work
