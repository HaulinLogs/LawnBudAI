# Test-Driven Development (TDD) Guidelines

## Overview

LawnBudAI enforces Test-Driven Development practices to ensure code quality, maintainability, and reliable product delivery. All code changes must include corresponding tests before being merged.

## TDD Rules

### 1. Write Tests First
- **Rule**: Write test cases BEFORE implementing the feature
- **Rationale**: Tests define expected behavior and serve as specification
- **Example**: For `useWaterEvents.ts`, write tests for `addEvent()`, `deleteEvent()`, and `getStats()` before implementing
- **Enforcement**: Code review will block PRs without corresponding tests

### 2. Test Coverage Thresholds
- **Minimum Coverage**: 70% for all metrics (lines, functions, branches, statements)
- **Target Coverage**: 80%+ for new code in Phase 3+
- **Measurement**: Run `yarn test:coverage` before committing
- **Enforcement**: Pre-push hook verifies coverage thresholds

### 3. Test Categories

#### Unit Tests (./\_\_tests\_\_/\*.test.ts)
- Test individual functions, hooks, and utilities
- Mock external dependencies (Supabase, navigation, APIs)
- Fast execution (<100ms per test)
- Example: `useWaterEvents.test.ts` tests hook logic in isolation

#### Component Tests (./\_\_tests\_\_/\*.test.tsx)
- Test UI component rendering and interactions
- Use React Testing Library best practices (`render`, `fireEvent`, `waitFor`)
- Test user interactions, not implementation details
- Example: `WateringScreen.test.tsx` tests form submission flow

#### E2E Tests (./playwright/\*.spec.ts)
- Test complete user flows across the entire application
- Test real Supabase integration (or test database)
- Verify UI, navigation, and data persistence
- Slower execution but highest confidence
- Run before merging to main: `yarn test:playwright`

#### Integration Tests
- Test multiple components/hooks working together
- Verify Supabase RLS policies work correctly
- Test authentication flows end-to-end
- Part of Phase 3.4 deliverables

### 4. Quality Gates

All of the following must pass before pushing code:

```bash
yarn quality-gates
```

This runs:
1. **Linting Check**: `yarn lint:ci` (0 errors, 0 warnings)
2. **Unit Tests**: `yarn testFinal` (all tests passing)
3. **Coverage Report**: `yarn test:coverage` (70% minimum)
4. **Security Audit**: `npm audit` (no high/critical vulnerabilities)

### 5. Pre-Commit Hooks

Automatically run before each commit:
- **ESLint with auto-fix**: Formats code to project standards
- **Prettier**: Ensures consistent code formatting
- **Runs lint-staged**: Only checks changed files

### 6. Pre-Push Hooks

Automatically run before pushing to remote:
- Full linting check (0 errors, 0 warnings)
- All tests passing
- Coverage thresholds met
- No security vulnerabilities

Prevents pushing broken code to the repository.

## Development Workflow

### Step 1: Write Tests
```typescript
// __tests__/useWaterEvents.test.ts
describe('useWaterEvents', () => {
  it('should fetch water events from Supabase', async () => {
    // Test implementation
  });

  it('should add a new water event', async () => {
    // Test implementation
  });
});
```

### Step 2: Implement Feature
```typescript
// hooks/useWaterEvents.ts
export function useWaterEvents() {
  // Implementation
}
```

### Step 3: Run Tests Locally
```bash
# Watch mode for development
yarn test

# Debug mode if tests fail
yarn testDebug

# Final check before commit
yarn testFinal
```

### Step 4: Check Coverage
```bash
yarn test:coverage
```

Ensure coverage meets thresholds. If too low:
- Add more test cases
- Remove untested code
- Refactor to improve testability

### Step 5: Lint and Format
```bash
# Auto-fix linting issues
yarn lint:fix

# Run final linting check
yarn lint:ci
```

### Step 6: Commit Code
```bash
git add .
git commit -m "Feature: Add water event tracking"
```

Pre-commit hook runs automatically:
- ESLint auto-fix
- Prettier formatting
- Commit only proceeds if hooks pass

### Step 7: Push to Remote
```bash
git push origin feature-branch
```

Pre-push hook runs automatically:
- Full linting
- All tests
- Coverage check
- Security audit

Push only proceeds if all gates pass.

## Testing Best Practices

### 1. Unit Test Structure
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do X when Y', () => {
    // Arrange
    const input = { /* data */ };

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### 2. Mocking External Dependencies
```typescript
// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: [] })
    })
  }
}));
```

### 3. Component Testing
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';

it('should submit form data', async () => {
  render(<WateringScreen />);

  const input = screen.getByPlaceholderText('Amount');
  fireEvent.changeText(input, '25.5');

  const button = screen.getByText('Record Watering');
  fireEvent.press(button);

  await waitFor(() => {
    expect(screen.getByText('Success')).toBeTruthy();
  });
});
```

### 4. E2E Testing (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test('should record a watering event end-to-end', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Login
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('button:has-text("Sign In")');

  // Navigate to watering screen
  await page.click('text=Watering');

  // Fill form
  await page.fill('[placeholder="Amount"]', '25.5');
  await page.click('button:has-text("Record Watering")');

  // Verify
  await expect(page.locator('text=Success')).toBeVisible();
});
```

## Coverage Requirements by Phase

- **Phase 0-2**: 50% minimum (foundation work)
- **Phase 3.0-3.3**: 70% minimum (core features)
- **Phase 3.4+**: 80% minimum (production ready)

## Continuous Integration

This project includes CI/CD quality gates that run on every PR:

1. **ESLint Check**: All code formatted correctly
2. **Test Suite**: All unit and component tests pass
3. **Coverage Report**: Meets minimum thresholds
4. **Security Audit**: No vulnerabilities

PRs cannot be merged until all CI checks pass.

## Common Issues

### Tests Failing
```bash
# Run in debug mode
yarn testDebug

# Update snapshots if needed
yarn updateSnapshots

# Check test logs for mocking issues
yarn test -- --verbose
```

### Coverage Too Low
- Add test cases for uncovered branches
- Check `yarn test:coverage` report for gaps
- Refactor complex code to improve testability

### Pre-Push Hook Failing
```bash
# Fix linting issues
yarn lint:fix

# Run tests to verify
yarn testFinal

# Check coverage
yarn test:coverage
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library Docs](https://testing-library.com/react-native)
- [Playwright Documentation](https://playwright.dev/)
- [Project Test Files](./__tests__/)

## Questions?

Refer to existing test files for examples:
- `__tests__/useWaterEvents.test.ts`
- `__tests__/useMowEvents.test.ts`
- `__tests__/MowingScreen.test.tsx`
- `__tests__/WateringScreen.test.tsx`
