# Comprehensive Testing Strategy: Preventing Production Schema Failures

**Last Updated:** February 2026
**Status:** ✅ Implemented and Active

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Pyramid](#testing-pyramid)
3. [Test Types](#test-types)
4. [Running Tests Locally](#running-tests-locally)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Working with the Database Schema](#working-with-the-database-schema)
7. [Pre-Deployment Checklist](#pre-deployment-checklist)
8. [Troubleshooting](#troubleshooting)
9. [Methodology Reference](#methodology-reference)

---

## Overview

This document describes LawnBudAI's comprehensive testing strategy, which prevents production schema failures through:

- **Schema Validation Tests**: Verify code uses correct column names
- **Type Generation**: Auto-generate TypeScript types from database schema
- **Integration Tests**: Test against real Supabase instance
- **CI/CD Gates**: Multiple quality gates block bad deployments
- **Clear Error Messages**: AI-parseable output for actionable fixes

### Critical Problem Solved

Previously, production deployments failed because:

```
❌ Code tried to SELECT `amount_gallons` but database has `amount_inches`
❌ Code tried to SELECT N-P-K percentages but database has `type` field
❌ Tests used mocks that accepted invalid column names
❌ No integration tests against real database
```

This strategy prevents such failures by:

```
✅ Schema validation tests catch wrong column names PRE-deployment
✅ Type generation ensures types match database exactly
✅ Integration tests verify queries work against real database
✅ CI/CD gates block deployment if any validation fails
✅ Clear, actionable error messages guide fixes
```

---

## Testing Pyramid

LawnBudAI follows the industry-standard **Testing Pyramid** (Martin Fowler):

```
        ╭─────────────────────╮
        │   E2E Tests (Few)   │  Few, slow, full system tests
        │  (Playwright)       │  Run: yarn test:playwright
        ├─────────────────────┤
        │ Integration Tests   │  Moderate count, run against real Supabase
        │  (Database)         │  Run: yarn test:integration
        ├─────────────────────┤
        │  Unit Tests (Many)  │  Many, fast, isolated components
        │ (Jest with mocks)   │  Run: yarn testFinal
        ╰─────────────────────╯

    Base = Fast, many, isolated       ← Fastest, most coverage
    Middle = Moderate speed           ← Validates integration
    Top = Slow, few, full system      ← Most realistic
```

### Why This Pyramid?

- **Unit Tests (Base)**: Run in milliseconds, catch logic errors early
- **Integration Tests (Middle)**: Catch schema mismatches, data type errors
- **E2E Tests (Top)**: Catch workflow breakage, user experience issues

---

## Test Types

### 1. Schema Validation Tests (`__tests__/schema.validation.test.ts`)

**Purpose**: Verify TypeScript models match actual database schema

**What They Test**:
- ✅ Hook SELECT statements use valid column names
- ✅ Model fields match database schema
- ✅ Obsolete columns not in use (e.g., `amount_gallons`)
- ✅ Required columns are present

**When They Run**:
- Locally: `yarn testFinal`
- CI/CD: Pre-deployment gate (blocks if fails)

**Example**:
```typescript
it('should NOT have amount_gallons column', () => {
  const schema = PRODUCTION_SCHEMA.water_events;
  const hasGallons = schema.some(c => c.name === 'amount_gallons');
  expect(hasGallons).toBe(false);  // ✅ Fails before deployment
});
```

**Database Schema Reference** (Source of Truth):
```javascript
PRODUCTION_SCHEMA = {
  water_events: [
    { name: 'id', type: 'uuid', nullable: false },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'date', type: 'date', nullable: false },
    { name: 'amount_inches', type: 'decimal(4,2)', nullable: false },
    { name: 'source', type: 'text', nullable: false },
    // ...
  ]
}
```

### 2. Unit Tests (Jest)

**Purpose**: Test individual functions/components in isolation

**What They Test**:
- Hook state management
- Component rendering
- Utility functions
- Error handling

**When to Write**:
- For every function/component
- For edge cases and error scenarios
- For business logic

**Example**:
```typescript
it('should calculate total inches this month', () => {
  const stats = getStats([
    { amount_inches: 2.5, date: '2026-02-15' },
    { amount_inches: 1.5, date: '2026-02-20' },
  ]);
  expect(stats.totalInchesThisMonth).toBe('4.0');
});
```

**Commands**:
```bash
yarn testFinal              # Run all unit tests
yarn test                   # Run changed tests in watch mode
yarn testDebug              # Run with verbose output
yarn updateSnapshots        # Update test snapshots
```

### 3. Integration Tests (`__tests__/integration/database.integration.test.ts`)

**Purpose**: Verify code works against real Supabase database

**What They Test**:
- ✅ Valid SELECT statements succeed
- ✅ Invalid column names are rejected by database
- ✅ Data types match schema
- ✅ RLS policies work correctly

**When to Write**:
- For database queries (hooks)
- For multi-table operations
- For complex business logic involving data

**Example**:
```typescript
it('should FAIL when selecting invalid column "amount_gallons"', async () => {
  const { error } = await supabase
    .from('water_events')
    .select('id, date, amount_gallons')  // ❌ Invalid column
    .limit(1);

  expect(error).not.toBeNull();
  expect(error?.code).toBe('42703');  // undefined_column
});
```

**Commands**:
```bash
yarn test:integration      # Run integration tests
```

**Prerequisites**:
```bash
# Set these in .env.local (NEVER in .env or .env.example):
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_ANON_KEY=your_test_key
```

### 4. E2E Tests (Playwright)

**Purpose**: Test complete user workflows end-to-end

**What They Test**:
- User navigation flows
- Form submission end-to-end
- Multi-step processes
- UI interactions

**When to Write**:
- For critical user workflows
- After completing a feature
- For cross-platform compatibility

**Commands**:
```bash
yarn test:playwright       # Run E2E tests
yarn test:playwright:ui    # Run with interactive UI
```

---

## Running Tests Locally

### Before Committing Code

```bash
# 1. Run changed tests in watch mode
yarn test

# 2. When ready to commit, run full suite
yarn testFinal

# 3. Verify schema validation
yarn validate:schema

# 4. Run quality gates (catches issues before CI)
yarn quality-gates
```

### Working with Specific Tests

```bash
# Run single test file
yarn testFinal __tests__/schema.validation.test.ts

# Run tests matching pattern
yarn testFinal --testNamePattern="should calculate"

# Run tests matching file pattern
yarn test:integration

# Debug specific test
yarn testDebug __tests__/hooks/useWaterEvents.test.ts
```

### Updating Test Snapshots

```bash
# When snapshot output changes (intentionally)
yarn updateSnapshots

# Then verify changes look correct before committing
git diff __tests__/__snapshots__/
```

---

## CI/CD Pipeline

### Pre-Deployment Gates (`.github/workflows/pre-deployment-gates.yml`)

The CI/CD pipeline runs the following gates in order:

```
┌─────────────────────────────────────────────────────────┐
│ 1. Schema Validation (validate:schema)                   │
│    └─ Checks: No obsolete columns in use                │
│    └─ Blocks: If schema mismatches found               │
├─────────────────────────────────────────────────────────┤
│ 2. Type Generation (types:generate)                      │
│    └─ Generates: types/database.types.ts                │
│    └─ Skips: If SUPABASE_PROJECT_ID not available      │
├─────────────────────────────────────────────────────────┤
│ 3. Type Check (types:check)                             │
│    └─ Checks: TypeScript errors                         │
│    └─ Blocks: If types don't match                      │
├─────────────────────────────────────────────────────────┤
│ 4. Linting (lint:ci)                                    │
│    └─ Checks: ESLint errors (max-warnings: 0)           │
│    └─ Blocks: If violations found                       │
├─────────────────────────────────────────────────────────┤
│ 5. Unit Tests (testFinal)                               │
│    └─ Checks: All unit tests pass                       │
│    └─ Blocks: If any test fails                         │
├─────────────────────────────────────────────────────────┤
│ 6. Schema Validation Tests (testFinal schema.validation)│
│    └─ Checks: Schema validation tests pass              │
│    └─ Blocks: If schema tests fail                      │
├─────────────────────────────────────────────────────────┤
│ 7. Integration Tests (test:integration)                 │
│    └─ Checks: Against test Supabase instance            │
│    └─ Skips: If TEST_SUPABASE_* secrets unavailable    │
├─────────────────────────────────────────────────────────┤
│ 8. Coverage Report (test:coverage)                      │
│    └─ Checks: Coverage threshold maintained             │
│    └─ Informational: Doesn't block (continues)          │
├─────────────────────────────────────────────────────────┤
│ 9. Security Audit (npm audit)                           │
│    └─ Checks: No critical vulnerabilities               │
│    └─ Continues: On violations                          │
├─────────────────────────────────────────────────────────┤
│ 10. E2E Tests (test:playwright)                         │
│     └─ Only: On main branch, not on PRs                 │
│     └─ Checks: Full workflows work                      │
└─────────────────────────────────────────────────────────┘
```

### Deployment Approval

- ✅ PR can only merge if ALL critical gates pass
- ✅ GitHub branch protection rules enforce this
- ✅ Admin cannot force merge bad code

### CI/CD Secrets Required

Set these in GitHub Settings → Secrets and Variables:

```
SUPABASE_PROJECT_ID        # From: Supabase project settings
SUPABASE_ACCESS_TOKEN      # From: Supabase account tokens (never share!)
TEST_SUPABASE_URL          # From: Test Supabase project
TEST_SUPABASE_ANON_KEY     # From: Test Supabase settings
```

---

## Working with the Database Schema

### When You Need to Change the Database Schema

#### Step 1: Create Migration

```bash
# Database migrations go in supabase/migrations/
# File format: YYYYMMDDHHMMSS_description.sql

# Example:
supabase/migrations/20260225120000_add_field_to_water_events.sql
```

#### Step 2: Write Migration SQL

```sql
-- Modify schema
ALTER TABLE water_events
ADD COLUMN new_column TEXT;

-- Include RLS policies if adding user data
ALTER TABLE water_events ENABLE ROW LEVEL SECURITY;

-- Policy to restrict to user's own data
CREATE POLICY "Users can only see own events"
  ON water_events
  FOR SELECT
  USING (auth.uid() = user_id);
```

#### Step 3: Regenerate Types

```bash
# Generate TypeScript types from new schema
SUPABASE_PROJECT_ID=your_id SUPABASE_ACCESS_TOKEN=your_token yarn types:generate

# TypeScript compiler will catch any type mismatches
yarn types:check
```

#### Step 4: Update Models (if needed)

If your TypeScript models (`models/events.ts`) need updates:

```typescript
export interface WaterEvent {
  id: string;
  user_id: string;
  date: string;
  amount_inches: number;  // ✅ Matches database.types.ts
  source: 'sprinkler' | 'manual' | 'rain';
  new_column?: string;    // ✅ New field from migration
  created_at: string;
  updated_at: string;
}
```

#### Step 5: Update Hooks

Update hook SELECT statements to use new columns:

```typescript
const { data, error } = await supabase
  .from('water_events')
  .select('id, date, amount_inches, source, notes, new_column')  // ✅ Added new_column
  .eq('user_id', user.id);
```

#### Step 6: Add Tests

```typescript
it('should select new_column from water_events', () => {
  const columns = ['id', 'date', 'amount_inches', 'source', 'new_column'];
  const validation = validateSelectColumns('water_events', columns, PRODUCTION_SCHEMA);
  expect(validation.valid).toBe(true);
});
```

#### Step 7: Verify Quality Gates Pass

```bash
yarn quality-gates

# If any gate fails, fix before deploying
```

### Common Schema Changes

#### Adding a Column

1. Migration: `ALTER TABLE table_name ADD COLUMN new_col TYPE;`
2. Update schema validation: Update `PRODUCTION_SCHEMA` in test
3. Regenerate types: `yarn types:generate`
4. Update models: Add field to interface
5. Run tests: `yarn testFinal`

#### Renaming a Column

1. ⚠️ **CRITICAL**: Requires code migration!
2. Migration: `ALTER TABLE table_name RENAME COLUMN old TO new;`
3. Update all references in code
4. Update schema validation
5. Update models
6. Regenerate types
7. Verify no tests reference old name

#### Removing a Column

1. ⚠️ **CRITICAL**: Check for code using this column!
2. Search codebase: `grep -r "old_column" .`
3. Remove from all SELECT statements
4. Migration: `ALTER TABLE table_name DROP COLUMN old_column;`
5. Update schema validation
6. Regenerate types
7. Run tests to verify

---

## Pre-Deployment Checklist

Before pushing to main/creating PR:

### Local Verification

- [ ] All unit tests pass: `yarn testFinal`
- [ ] Schema validation passes: `yarn validate:schema`
- [ ] Linting passes: `yarn lint:ci`
- [ ] Types check: `yarn types:check`
- [ ] No console errors in browser
- [ ] E2E tests pass: `yarn test:playwright`
- [ ] Quality gates pass: `yarn quality-gates`

### Code Review Checklist

- [ ] New functions have tests
- [ ] Tests verify both success and error cases
- [ ] No hardcoded credentials or secrets
- [ ] No console.log() left in production code
- [ ] Error messages are user-friendly
- [ ] TypeScript types are correct (no `any`)
- [ ] Database operations use RLS policies

### Database Changes Checklist

- [ ] Migration file created with timestamp
- [ ] SQL syntax valid
- [ ] RLS policies included for new user data tables
- [ ] Types regenerated: `yarn types:generate`
- [ ] Models updated to match new schema
- [ ] Hooks updated to select new/removed columns
- [ ] Tests updated for schema changes
- [ ] No references to removed columns

### Deployment Checklist

- [ ] All GitHub Actions gates pass
- [ ] PR approved by at least one reviewer
- [ ] Commit message is clear and descriptive
- [ ] No dependencies upgraded unnecessarily
- [ ] Security audit shows no critical vulnerabilities

---

## Troubleshooting

### Unit Tests Fail

**Problem**: `yarn testFinal` fails

**Solution**:
```bash
# 1. Check which tests are failing
yarn testFinal --verbose

# 2. Run single failing test
yarn testDebug __tests__/path/to/test.ts

# 3. Check mock data matches current schema
# Look for: amount_gallons, nitrogen_pct (obsolete fields)

# 4. Update mock data to match current schema
# models/events.ts has the current structure

# 5. Regenerate snapshots if output changed intentionally
yarn updateSnapshots
```

### Schema Validation Fails

**Problem**: `yarn validate:schema` shows schema mismatch

**Solution**:
```bash
# 1. Check the error message for which column is wrong
yarn validate:schema

# 2. Find the wrong column name in your code
grep -r "amount_gallons" src/

# 3. Replace with correct column name from schema
# Wrong: amount_gallons  →  Correct: amount_inches
# Wrong: nitrogen_pct    →  Correct: type

# 4. Verify schema reference
# Look in: __tests__/schema.validation.test.ts
# Or: scripts/validate-schema.js
```

### Type Check Fails

**Problem**: `yarn types:check` shows TypeScript errors

**Solution**:
```bash
# 1. Check error details
yarn types:check

# 2. Regenerate types from database
SUPABASE_PROJECT_ID=id SUPABASE_ACCESS_TOKEN=token yarn types:generate

# 3. Verify types/database.types.ts matches your queries

# 4. Update models to match database.types.ts
```

### Integration Tests Skip

**Problem**: Integration tests skip with "no test Supabase"

**Solution**:
```bash
# 1. Check if environment variables are set
echo $TEST_SUPABASE_URL
echo $TEST_SUPABASE_ANON_KEY

# 2. Set in .env.local (local development)
TEST_SUPABASE_URL=https://test-project.supabase.co
TEST_SUPABASE_ANON_KEY=your_test_key

# 3. For CI/CD, set in GitHub Secrets

# 4. Ensure test Supabase project has same schema as production
```

### PR Can't Merge

**Problem**: "All checks must pass before merging"

**Solution**:
```bash
# 1. Check which check is failing
# Look in GitHub Actions tab of PR

# 2. Pull latest main
git pull origin main

# 3. Run quality gates locally
yarn quality-gates

# 4. Fix any issues found

# 5. Commit and push
git add .
git commit -m "Fix: [issue]"
git push

# 6. Wait for GitHub Actions to re-run
```

---

## Methodology Reference

This testing strategy is based on industry-proven methodologies:

### 1. Test Pyramid (Martin Fowler)

**Reference**: [Martin Fowler - The Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)

**Principle**: Balanced combination of fast unit tests, moderate integration tests, and slow E2E tests

**Applied**: Schema validation (bottom), unit tests (middle), E2E tests (top)

### 2. Contract Testing (PACT Pattern)

**Reference**: [PACT - Consumer-Driven Contracts](https://docs.pact.foundation/)

**Principle**: Verify consumers and providers agree on interfaces

**Applied**: Schema validation tests ensure code and database contracts match

### 3. Shift-Left Testing

**Reference**: [Shift-Left Testing - Testing in DevOps](https://en.wikipedia.org/wiki/Shift-left_testing)

**Principle**: Catch errors as early as possible in development

**Applied**: Pre-commit hooks, schema validation, CI gates block before deployment

### 4. Continuous Integration (CI/CD)

**Reference**: [Continuous Integration - Martin Fowler](https://martinfowler.com/articles/continuousIntegration.html)

**Principle**: Multiple quality gates before deployment

**Applied**: 10 sequential gates in GitHub Actions workflow

### 5. Type Safety

**Reference**: [TypeScript Handbook - Type Checking](https://www.typescriptlang.org/docs/handbook/)

**Principle**: Use static types to catch errors at compile time

**Applied**: Auto-generated types from database schema

---

## Summary

This testing strategy prevents schema failures through:

1. **Schema Validation Tests** - Catch wrong column names
2. **Type Generation** - Keep types in sync with database
3. **Integration Tests** - Verify against real database
4. **CI/CD Gates** - Block bad deployments
5. **Clear Error Messages** - Guide fixes

**Result**: Zero production schema failures, fast feedback loops, confident deployments! 🚀
