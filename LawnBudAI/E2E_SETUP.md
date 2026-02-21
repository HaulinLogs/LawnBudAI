# E2E Testing Setup Guide

This project uses Playwright for end-to-end testing against the Expo Web export. Tests require proper configuration and setup.

## Prerequisites

- Node.js 16+ installed
- Supabase project created and configured (see `.env.example` for SUPABASE_URL and ANON_KEY)
- A test user account in your Supabase project

## Setting Up Test User Credentials

Before running E2E tests, you must create a test user in Supabase:

### Step 1: Create Test User in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user**
4. Create a new user with:
   - **Email**: `test@example.com` (or your preferred test email)
   - **Password**: Create a strong test password (e.g., `TestPassword123!`)
   - **Auto confirm user**: Enable this to confirm the email automatically
5. Click **Create user**

### Step 2: Configure Environment Variables

Create a `.env.local` file in the project root with your test credentials:

```bash
# Copy from your Supabase project
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Test user credentials (from Step 1)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

**IMPORTANT**: Never commit `.env.local` to version control! Add it to `.gitignore` if not already present.

### Step 3: Verify Configuration

Run a quick test to verify everything is set up:

```bash
npx playwright test e2e/playwright/debug-auth.spec.ts --project=chromium
```

You should see output indicating whether authentication succeeds.

## Running E2E Tests

Once configured, you can run the full E2E test suite:

```bash
# Run all tests
yarn test:playwright

# Run specific test file
yarn test:playwright e2e/playwright/mow-events.spec.ts

# Run in interactive UI mode
yarn test:playwright:ui

# Run with headed browser (see the browser during test)
npx playwright test --headed
```

## Troubleshooting

### Authentication Fails

If tests fail with "could not find mowing tab" or form elements not found, authentication likely failed:

1. **Verify credentials**: Double-check `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` match the user you created
2. **Check email confirmation**: Ensure the test user's email is confirmed in Supabase (check Authentication > Users > email confirmed column)
3. **Test manually**: Try signing in manually at `http://localhost:3000/LawnBudAI/sign-in`
4. **Check Supabase config**: Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are correct

### Asset Loading Fails

If tests fail with asset loading errors (404s):

1. The custom server should handle `/LawnBudAI` paths correctly
2. Check that `npx serve dist` is serving from the correct directory
3. Verify `dist/` folder was generated: `ls -la dist/`

### Tests Timeout

If tests timeout:

1. Increase timeout in `playwright.config.ts` if running on slow machines
2. Check that the local dev server is running properly
3. Try running in headed mode to see what's happening: `npx playwright test --headed`

## Test Server Configuration

Tests use a custom Node.js server (`scripts/serve-dist.js`) to serve the Expo Web export at the correct `/LawnBudAI` path, matching the production GitHub Pages structure.

- **Local URL**: `http://localhost:3000/LawnBudAI/`
- **Production URL**: `https://haulinlogs.github.io/LawnBudAI/`

This ensures tests run against the same path configuration as production.

## Security Notes

- **Never commit test credentials** in code or version control
- **Use `.env.local`** for local testing (listed in `.gitignore`)
- **Use `.env.test`** for CI/CD test credentials (set via GitHub Actions secrets)
- **Regenerate test credentials** if ever committed accidentally

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Expo Web Deployment](https://docs.expo.dev/distribution/publishing-websites/)
