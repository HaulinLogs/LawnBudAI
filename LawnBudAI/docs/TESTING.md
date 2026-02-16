# Testing Strategy & Guide

This document covers testing infrastructure for LawnBudAI across unit tests, component tests, and end-to-end tests.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test                    # Unit + component tests
npm run test:watch         # Unit tests in watch mode
npm run test:coverage      # Unit tests with coverage report
npm run test:playwright    # Web E2E tests (requires web export)
npm run test:playwright:ui # Web E2E tests in interactive mode
npm run test:maestro       # Mobile E2E tests (requires app running)
```

## Testing Architecture

```
Testing Infrastructure (Phase 0.5)
├── Unit Tests (Jest)
│   ├── lib/roleGuard.test.ts          — Pure logic tests
│   ├── lib/rateLimiter.test.ts        — Mock Supabase RPC
│   └── hooks/useRole.test.ts          — Mock Supabase queries
├── Component Tests (React Testing Library)
│   └── components/PremiumGate.test.tsx — Render + interaction
├── Web E2E Tests (Playwright)
│   ├── e2e/playwright/auth.spec.ts     — Sign in/up/out
│   └── e2e/playwright/navigation.spec.ts — Tab nav, settings
└── Mobile E2E Tests (Maestro YAML)
    ├── .maestro/sign-in.yml            — Auth flows
    ├── .maestro/home.yml               — Home screen
    └── .maestro/settings.yml           — Settings + plan tier
```

## Unit & Component Tests (Jest)

### Setup

```bash
npm install --save-dev jest jest-expo @types/jest @testing-library/react-native
```

Jest configuration is in `package.json`:
```json
{
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*)"
    ]
  }
}
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- roleGuard.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="hasPermission"

# Update snapshots (if using snapshot testing)
npm test -- -u
```

### Writing Unit Tests

**Example: Pure logic test (no mocks)**

```typescript
// __tests__/lib/roleGuard.test.ts
import { hasPermission } from '@/lib/roleGuard';

describe('roleGuard', () => {
  it('should allow users with equal or higher roles', () => {
    expect(hasPermission('admin', 'premium')).toBe(true);
    expect(hasPermission('user', 'premium')).toBe(false);
  });
});
```

**Example: Test with mocks**

```typescript
// __tests__/hooks/useRole.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useRole } from '@/hooks/useRole';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn() },
  },
}));

describe('useRole', () => {
  it('should fetch user role from database', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
    });

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBe('user');
  });
});
```

## Web E2E Tests (Playwright)

### Setup

```bash
npm install --save-dev @playwright/test
npx playwright install  # Download browsers
```

### Running Tests

```bash
# Run all web E2E tests
npm run test:playwright

# Interactive mode (UI testing, inspect selectors)
npm run test:playwright:ui

# Run specific test file
npx playwright test e2e/playwright/auth.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium

# Run with headed browser (see what's happening)
npx playwright test --headed

# Debug mode (step through tests)
npx playwright test --debug
```

### Configuration

**playwright.config.ts** defines:
- Web server startup command: `expo export -p web && serve dist -l 3000`
- Browsers: Chromium, Firefox, WebKit
- Mobile emulation: iPhone 12, Pixel 5
- Base URL: `http://localhost:3000`

### Writing Web E2E Tests

```typescript
// e2e/playwright/auth.spec.ts
import { test, expect } from '@playwright/test';

test('should display sign in screen', async ({ page }) => {
  await page.goto('/');

  // Find element by text
  const signIn = page.locator('text=/sign in/i');
  await expect(signIn).toBeVisible();
});

test('should navigate between tabs', async ({ page }) => {
  await page.goto('/');

  // Click button
  const settingsTab = page.locator('button:has-text("Settings")');
  await settingsTab.click();

  // Verify navigation
  expect(page.url()).toContain('settings');
});
```

## Mobile E2E Tests (Maestro)

### Setup

```bash
# Install Maestro CLI globally
curl -Ls "https://get.maestro.mobile.dev" | bash

# Add to ~/.zshrc or ~/.bash_profile
export PATH="$PATH":"$HOME/.maestro/bin"

# Verify installation
maestro --version
```

### Running Tests

```bash
# Run all Maestro flows
maestro test .maestro/

# Run specific flow
maestro test .maestro/sign-in.yml

# Run with live view (see app interaction in real-time)
maestro test --debug .maestro/sign-in.yml
```

### Prerequisites for Mobile Tests

1. **Start the app on your device/simulator:**
   - iOS: `npm run ios`
   - Android: `npm run android`

2. **Maestro connects to the running app** (no separate build needed)

3. **Supported platforms:**
   - iOS Simulator (mac only)
   - Android Emulator (any platform)
   - Real iOS device (via USB or WiFi)
   - Real Android device (via USB)

### Writing Mobile E2E Tests (YAML)

```yaml
# .maestro/sign-in.yml
appId: com.lawnbudai.app
---
- launchApp
- assertVisible: "Home"

# If auth required:
# - tapOn: "Sign In"
# - inputText: "test@example.com"  # Enter email
# - tapOn: "Next"                  # (if two-step)
# - inputText: "password123"       # Enter password
# - tapOn: "Sign In"
# - assertVisible: "Home"          # Verify success
```

### Maestro Commands Reference

| Command | Purpose |
|---------|---------|
| `launchApp` | Start the app (or bring to foreground) |
| `assertVisible: "text"` | Verify text/button is on screen |
| `tapOn: "text"` | Tap a button/element by text |
| `inputText: "value"` | Type text into focused field |
| `scroll: { direction: "down" }` | Scroll in a direction |
| `wait: { seconds: 2 }` | Wait for N seconds |
| `swipe: { direction: "left" }` | Swipe in a direction |
| `runFlow: "other.yml"` | Run another Maestro flow |

## Test Phases

Each development phase gates on **all tests passing** before moving to the next phase:

### Phase 1 → Phase 2
- ✅ Auth hook tests
- ✅ Auth screen E2E tests
- ✅ Settings sync E2E tests

### Phase 2 → Phase 3
- ✅ Role guard unit tests
- ✅ Rate limiter unit tests
- ✅ useRole hook tests
- ✅ PremiumGate component tests

### Phase 3 → Phase 4
- ✅ useTodo hook tests
- ✅ Data entry form tests
- ✅ Form submission E2E tests

### Phase 4 → Phase 5
- ✅ Recommendation engine tests
- ✅ Notification scheduling tests
- ✅ Notification display E2E tests

### Phase 5 → Phase 6 (Production)
- ✅ Full regression suite
- ✅ <5% crash rate on real devices
- ✅ No console errors in E2E tests

## CI/CD Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm install
      - run: npm test  # Unit tests
      - run: npm run test:coverage  # Coverage check

      # Playwright tests on push to main only
      - if: github.ref == 'refs/heads/main'
        run: npm run test:playwright
```

## Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

Target coverage for Phase 2+:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## Debugging Tests

### Jest Debugging

```bash
# Run tests with Node inspector (requires breakpoints in code)
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open chrome://inspect in Chrome
```

### Playwright Debugging

```bash
# Interactive mode
npm run test:playwright:ui

# Or with --debug flag
npx playwright test --debug e2e/playwright/auth.spec.ts
```

### Maestro Debugging

```bash
# Run with live view
maestro test --debug .maestro/sign-in.yml

# Check logs (iOS)
log stream --predicate 'process == "LawnBudAI"'

# Check logs (Android)
adb logcat | grep LawnBudAI
```

## Common Issues & Solutions

### Jest can't find modules
**Solution**: Check `moduleNameMapper` in `package.json`. The `@/` alias must resolve correctly:
```json
{
  "jest": {
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1"
    }
  }
}
```

### Playwright can't start web server
**Solution**: Ensure `expo export -p web` works locally first:
```bash
npx expo export -p web
npx serve dist -l 3000
# Then visit http://localhost:3000
```

### Maestro: "App not responding"
**Solution**:
1. Make sure app is running: `npm run ios` or `npm run android`
2. Increase wait times in YAML: `wait: { seconds: 5 }`
3. Check app logs for errors

### Tests pass locally but fail in CI
**Solution**:
- Tests may be timing out. Increase timeout in CI config.
- Dependencies may differ. Run `npm ci` instead of `npm install`.
- Use `--no-cache` in Jest for CI environments.

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react-native)
- [Playwright Documentation](https://playwright.dev/)
- [Maestro Documentation](https://maestro.mobile.dev/)
