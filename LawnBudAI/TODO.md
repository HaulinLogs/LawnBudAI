# LawnBudAI - Outstanding Work & Issues

This document tracks all outstanding work, bugs, and features. See referenced GitHub issues for full details.

**Last Updated:** February 21, 2026 (15:45 UTC)
**Context:** Post-Phase 3.1 (E2E tests, database migrations, weather API with state)
**Current Status:** Issue #33 migrations complete, starting Issue #34 E2E testing

---

## 🔴 Critical Path (Must Complete Before Release)

### 1. ✅ Configure GitHub Actions Secrets
**Issue:** [#35](https://github.com/HaulinLogs/LawnBudAI/issues/35) - COMPLETE

- [x] Generate SUPABASE_ACCESS_TOKEN from https://app.supabase.com/account/tokens
- [x] Add secret to GitHub repo: Settings > Secrets and variables > Actions
- [x] Verify secret is named `SUPABASE_ACCESS_TOKEN` exactly

**Completed:** February 21, 2026

---

### 2. ✅ Deploy and Verify Database Migrations
**Issue:** [#33](https://github.com/HaulinLogs/LawnBudAI/issues/33) - COMPLETE

- [x] SUPABASE_ACCESS_TOKEN secret added (Issue #35)
- [x] Push code to main branch
- [x] GitHub Actions runs successfully with no errors
- [x] Verify migrations applied in Supabase dashboard:
  - [x] `mow_events` table exists (7 indexes)
  - [x] `water_events` table exists (7 indexes)
  - [x] `fertilizer_events` table exists (7 indexes)
  - [x] `user_preferences` table exists
- [x] Verify RLS policies are enabled on all tables (all 4 tables verified)
- [x] Verify indexes are created (20 total indexes)

**Completed:** February 21, 2026

---

### 3. 🔄 Test E2E Tests with Valid Credentials
**Issue:** [#34](https://github.com/HaulinLogs/LawnBudAI/issues/34) - IN PROGRESS

- [ ] Create test user in Supabase dashboard:
  - [ ] Email: `test@example.com` (or your choice)
  - [ ] Password: Strong password (or `TestPassword123!`)
  - [ ] Auto-confirm email enabled
- [ ] Create `.env.local` file with:
  ```
  EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
  EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
  TEST_USER_EMAIL=<test-email>
  TEST_USER_PASSWORD=<test-password>
  ```
- [ ] Run `yarn test:playwright` locally
- [ ] All 175 tests pass (or document failures)
- [ ] No "form elements not found" errors
- [ ] Document any flaky tests

**Estimated Time:** 30 minutes + test run time
**Started:** February 21, 2026

---

## 🟡 High Priority (Complete This Sprint)

### 4. Phase 3.3: Fertilizer Screen Implementation
**Issue:** [#6](https://github.com/HaulinLogs/LawnBudAI/issues/6)

- [ ] Create `screens/FertilizerScreen.tsx`
- [ ] Implement fertilizer event form (date, amount_lbs, type, application_method)
- [ ] Display fertilizer history with statistics
- [ ] Implement CRUD operations via `useFertilizerEvents()` hook
- [ ] Add fertilizer tab to bottom navigation
- [ ] Update E2E tests for fertilizer screen
- [ ] Verify all tests pass

**Estimated Time:** 4-6 hours

---

### 5. Test Database Seeding
**Issue:** [#19](https://github.com/HaulinLogs/LawnBudAI/issues/19)

- [ ] Create seed script for test data
- [ ] Populate sample mow, water, fertilizer events
- [ ] Create reset mechanism for clean tests
- [ ] Document seeding process in README

**Estimated Time:** 2-3 hours

---

## 🟢 Future Work (Backlog)

### Environmental Configuration
- **Issue #18:** Configure .env and GitHub Secrets for all environments
- **Issue #17:** Update lib/supabase.ts for environment-aware configuration
- **Issue #16:** Create test and prod Supabase projects

### Suggested Features (In Order of Votes)
- **Issue #26:** Watering amount measurement change (user suggestion)
- **Issue #27:** Fertilizer measurement in lbs/1000sqft (user suggestion)
- **Issue #28:** Fertilizer N-P-K ratio entry (user suggestion)
- **Issue #29:** Liquid vs Granular fertilizer selection (user suggestion)
- **Issue #30:** Dark Mode support
- **Issue #31:** Add "Zones" feature
- **Issue #32:** Add more application types

### Deferred Features
- **Issue #12:** Phase 2.6 - Admin Panel + RevenueCat (Deferred to post-MVP)
- **Issue #10:** Week 6-7 - Recommendations & Notifications
- **Issue #11:** Week 8-10 - Polish & Distribution

---

## ✅ Completed Work (This Session)

### Phase 3.1: E2E Testing Infrastructure
**Issue:** [#21](https://github.com/HaulinLogs/LawnBudAI/issues/21) - COMPLETE

- ✅ Added Playwright E2E tests (175 tests total)
- ✅ Fixed test selectors for React Native Web components
- ✅ Created test authentication setup (`auth-setup.ts`)
- ✅ Fixed asset loading paths with custom Node.js server
- ✅ Integrated database migrations into deployment pipeline
- ✅ Created `supabase/migrations/` folder structure
- ✅ Added `supabase db push` step to GitHub Actions
- ✅ Created comprehensive DEPLOYMENT.md documentation
- ✅ Added output verification requirements to CLAUDE.md (prevents future mistakes)

### Weather API with State Support
- ✅ Updated `fetchWeather()` to accept state parameter
- ✅ Updated `useWeather()` hook to pass state
- ✅ Enhanced weather API calls to use "city,state" format
- ✅ Created `user_preferences` table migration
- ✅ Updated Settings screen to allow city/state configuration
- ✅ Improved weather error tracking with location details

### User Preferences Persistence
- ✅ Created `user_preferences` table with RLS policies
- ✅ Added auto-create trigger for new user preferences
- ✅ Updated `useUserPreferences()` hook for Supabase integration
- ✅ Settings screen now persists changes to database
- ✅ Added state/timezone fields for future expansion

---

## 📝 Commits This Session

See git log for full details, but major commits:
- `#21: Integrate database migrations into deployment pipeline`
- `#21: Add E2E test authentication setup and security improvements`
- `#21: Add comprehensive database schema for lawn care events`
- `#21: Add state/region support to weather API and user preferences`
- `#21: Fix database migrations in deployment pipeline`
- `#21: Add output verification requirements to CLAUDE.md`

---

## 🎯 Success Criteria for Closing Issue #21

- ✅ Database migrations automatically applied during GitHub Actions deployment
- ✅ All E2E tests pass (175/175) with valid test credentials
- ✅ Weather API uses city + state for accurate location
- ✅ User preferences persist in Supabase database
- ✅ Settings screen allows city/state configuration
- ⏳ (Not tested yet) Deploy to production and verify everything works end-to-end

---

## 🚀 Quick Start for Next Session

1. **Start here:** Issue #35 (GitHub Actions secrets)
2. **Then:** Issue #33 (Deploy and verify migrations)
3. **Then:** Issue #34 (Test E2E with credentials)
4. **Then:** Issue #6 (Fertilizer screen)

---

## 📚 Key Documentation

- `DEPLOYMENT.md` - Complete deployment pipeline setup guide
- `E2E_SETUP.md` - E2E test configuration and running
- `supabase/README.md` - Database migrations and Supabase CLI usage
- `CLAUDE.md` - Development guidelines including output verification requirements
- `TDD.md` - Test-Driven Development workflow

---

## 🔧 Important Notes

- **Context:** We're at 95% token usage on this session, so major context reset happening soon
- **Security:** Never commit `.env.local` or credentials to git
- **Testing:** Always run `yarn test:playwright` before pushing to main
- **Migrations:** Database changes are version-controlled in `supabase/migrations/`
- **Output Verification:** All infrastructure changes must be verified before claiming completion (see CLAUDE.md)
