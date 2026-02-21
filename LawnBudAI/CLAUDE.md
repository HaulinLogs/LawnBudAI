# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LawnBudAI** is a React Native mobile application built with Expo that helps users manage lawn care activities. The app provides tools for tracking mowing, watering, and fertilizing schedules, integrates real-time weather data, and stores historical lawn care events in Supabase PostgreSQL with Row Level Security (RLS) for multi-user data isolation.

## Development Commands

### Running the App
```bash
# Install dependencies
yarn install

# Start the Expo development server
yarn start

# Run on iOS simulator
yarn ios

# Run on Android emulator
yarn android

# Run on web browser
yarn web

# Reset project to fresh state (moves current app to app-example)
yarn reset-project
```

### Testing & Quality (TDD Enforcement)
```bash
# Run tests in watch mode (only changed files)
yarn test

# Run tests in debug mode with verbose output
yarn testDebug

# Run all tests once (use before committing)
yarn testFinal

# Generate coverage report
yarn test:coverage

# Update test snapshots
yarn updateSnapshots

# Run E2E tests with Playwright
yarn test:playwright

# Run E2E tests in interactive UI mode
yarn test:playwright:ui

# Run all quality gates (linting, tests, coverage, security)
yarn quality-gates
```

### Linting & Code Quality
```bash
# Check code for linting issues
yarn lint

# Auto-fix linting issues
yarn lint:fix

# Strict linting (used in CI/CD)
yarn lint:ci
```

## TDD Development Workflow

This project enforces Test-Driven Development (TDD). See `TDD.md` for complete guidelines.

**Quick Summary:**
1. Write tests first (before implementing feature)
2. Implement feature to pass tests
3. Pre-commit hook runs ESLint auto-fix and Prettier formatting
4. Pre-push hook enforces quality gates (linting, tests, coverage, security audit)
5. GitHub Actions runs quality gates on every PR

**Quality Gate Requirements:**
- ESLint: 0 errors, 0 warnings
- Tests: All passing (36+ existing tests)
- Coverage: 70% minimum (lines, functions, branches, statements)
- Security: No critical vulnerabilities (npm audit)

## Project Architecture

### High-Level Structure

The app follows Expo Router's file-based routing with the following architectural pattern:

- **Routing**: File-based routing via Expo Router in the `app/` directory
- **UI Components**: Reusable components in `components/`
- **Data Fetching**: Custom React hooks (`useWeather`, `useMowEvents`, `useWaterEvents`) for data management
- **External Data**: Weather API integration via `services/weather.ts`
- **Backend**: Supabase PostgreSQL database with Row Level Security (RLS) for multi-user data isolation
- **Type Safety**: TypeScript interfaces in `models/`

### Directory Structure

- **`app/(tabs)/`**: Tab-based navigation screens (Home, Mowing, Watering, Fertilizer)
- **`components/`**: Reusable UI components (WeatherCard, TodoStatusCard, ParallexScrollView, etc.)
- **`components/ui/`**: Low-level UI components (IconSymbol, TabBarBackground, HapticTab)
- **`services/`**: External API integrations (weather.ts)
- **`hooks/`**: Custom React hooks for state management (useWeather, useTodo, useColorScheme)
- **`models/`**: TypeScript interfaces and type definitions (weather.ts, todo.ts)
- **`database/`**: SQLite database setup and schema (init.ts)
- **`styles/`**: Global and component-specific styles
- **`constants/`**: App constants including color schemes

### Data Flow

1. **Weather Data**:
   - `useWeather` hook fetches from wttr.in API via `services/weather.ts`
   - Returns WeatherResponse interface with current conditions and forecast
   - Displays in HomeScreen via `WeatherCard` component

2. **Todo Management**:
   - `useTodo` hook manages lawn care tasks (mowing, watering, fertilizer)
   - Currently mock data; designed for future database integration
   - Displayed via `TodoStatusCard` components

3. **Supabase Backend**:
   - PostgreSQL database with Row Level Security (RLS) policies
   - Tables: `mow_events`, `water_events`, `fertilizer_events`, `users` (with auth integration)
   - All events are user-specific via `user_id` foreign key and RLS policies
   - Authentication via Supabase Auth with email/password
   - Real-time subscriptions available via Supabase realtime API

### Navigation Structure

- **Root Layout** (`app/_layout.tsx`): Handles theming and fonts
- **Tab Layout** (`app/(tabs)/_layout.tsx`): Bottom tab navigation with 4 screens:
  - Home (index.tsx): Dashboard with weather and todo status
  - Mowing (mowing.tsx): Mowing schedule and tracking
  - Watering (watering.tsx): Watering schedule and tracking
  - Fertilizer (fertilizer.tsx): Fertilizer application tracking

## Key Technologies

- **Expo**: Universal React app framework (v53.0.20)
- **React Native**: Cross-platform mobile development (0.79.5)
- **React**: UI library (19.0.0)
- **Expo Router**: File-based routing (5.1.4)
- **TypeScript**: Type-safe development (5.8.3)
- **Supabase**: PostgreSQL database + Auth + Realtime (v2.95.3)
- **Axios**: HTTP client (1.11.0)
- **@react-navigation**: Navigation system with native and bottom tabs
- **@expo/vector-icons**: Icon system with Ionicons
- **Jest**: Unit testing framework (v29.7.0)
- **Playwright**: E2E testing framework (@playwright/test v1.48.0)
- **ESLint**: Code linting via flat config (v9.25.0)
- **Prettier**: Code formatting (v3.3.3)
- **Husky**: Git hooks for TDD enforcement (v9.1.7)
- **Lint-staged**: Run linters on staged files (v15.2.10)

## Important Architectural Patterns

### Custom Hooks
The app uses custom React hooks for data management:
- `useWeather(city)`: Fetches weather data from wttr.in API with loading/error states
- `useMowEvents()`: CRUD operations for mowing events (Supabase backend)
  - `fetchEvents()`: Fetch user's mowing events ordered by date
  - `addEvent(input)`: Record new mowing event
  - `deleteEvent(eventId)`: Remove mowing event
  - `getStats()`: Calculate days since mow and average height
- `useWaterEvents()`: CRUD operations for watering events (Supabase backend)
  - `fetchEvents()`: Fetch user's watering events ordered by date
  - `addEvent(input)`: Record new watering event with source (sprinkler/manual/rain)
  - `deleteEvent(eventId)`: Remove watering event
  - `getStats()`: Calculate days since watering, monthly totals, averages
  - `getSourceBreakdown()`: Count events by source type
- `useColorScheme()`: Detects and provides dark/light mode support
- `useThemeColor()`: Returns color values based on theme

### Component Organization
- Functional components with React Hooks
- Styled using React Native StyleSheet
- Reusable UI components accept props for configuration
- Separate `.styles.ts` files for component-specific styling

### Supabase Backend Integration
- PostgreSQL database with Row Level Security (RLS) policies enforce user data isolation
- CRUD operations via Supabase JavaScript client (`@supabase/supabase-js`)
- Event tables: `mow_events`, `water_events`, `fertilizer_events`
- All tables have `user_id` foreign key and RLS policies to restrict access to event owner
- Authentication via Supabase Auth - integrated with event user_id for data isolation
- Hooks handle Supabase client initialization and error handling

### Error Handling
- Weather hook catches API errors and provides error state
- Components check for loading/error states before rendering
- Error messages displayed to user

### Styling
- React Native StyleSheet for performance
- Theme-aware colors via `Colors` constants
- Color scheme detection for dark/light modes
- Platform-specific styling via `Platform.select()`

## Common Development Tasks

### Adding a New Tab Screen
1. Create new file in `app/(tabs)/<name>.tsx`
2. Add screen to `app/(tabs)/_layout.tsx` with Tabs.Screen configuration
3. Create corresponding screen component (optional: with styles file)
4. Use custom hooks if data fetching is needed

### Adding Weather Integration
- Weather data flows through `useWeather` hook
- Extend WeatherResponse model in `models/weather.ts` if API contract changes
- Icon mapping via `getWeatherIcon()` function maps weather codes to Ionicons

### Database Operations
- Add SQL migrations to `database/init.ts` for schema changes
- Implement actual CRUD operations in hooks once database integration is active
- Use `expo-sqlite` API via transaction-based execution

## TDD & Quality Gates (Phase 3.0+)

**Critical:** All new code must include tests before implementation. Pre-commit and pre-push hooks enforce code quality:
- **Pre-commit**: Auto-fixes ESLint issues and runs Prettier
- **Pre-push**: Runs full quality gates (linting, tests, coverage, security audit)
- **CI/CD**: GitHub Actions validates all PRs

See `TDD.md` for complete TDD guidelines and testing best practices.

## Output Verification Requirements

**Critical:** All infrastructure, deployment, and configuration changes must be verifiable and explicitly proven before claiming completion. This prevents unfounded assumptions and ensures trustworthy output.

### For All Infrastructure/Deployment Changes

When making changes to `.yml`, `.toml`, `.sql`, or configuration files:

1. **Always READ the file AFTER editing** before claiming completion
2. **Show the actual file contents** to prove changes were applied (not just claimed)
3. **Explicitly flag assumptions** and verify them are correct
4. **Acknowledge when contradicting** previous statements with full explanation
5. **Document why** each requirement/secret exists and where it's used

### Required Verification Process

For any claim like "I updated X" or "I added Y to the deployment pipeline":

✅ **Correct approach:**
```
1. [Read the file after making changes]
2. "I updated deploy.yml. Here are the actual contents:
   - Lines 28-39 now include the migration step
   - The step runs 'supabase db push' with SUPABASE_ACCESS_TOKEN
   - I added explicit project linking before migrations"
3. [Show the actual file contents or diff]
4. [Explain the reasoning and any assumptions]
```

❌ **Incorrect approach:**
```
"I updated deploy.yml to include migrations"
[No verification, no file shown, assumption not verified]
```

### Red Flags to Call Out Immediately

Stop work and flag these patterns:

- ❌ "I updated X" without showing the actual file contents
- ❌ "We need secret Y" without explaining where it's used in code
- ❌ "This should work" without testing/verifying it
- ❌ Changing requirements without acknowledging the error
- ❌ Saying "let me verify" but never showing the verification
- ❌ Treating assumptions as facts without flagging them
- ❌ Removing previously stated requirements without explanation

### Specific Checks for Deployment Files

For `.github/workflows/deploy.yml`:
- [ ] Confirm all steps are present (lint, test, migrate, build, deploy)
- [ ] Verify environment variables/secrets are correct
- [ ] Check that working directories are specified correctly
- [ ] Confirm all dependencies (CLI tools) are installed before use
- [ ] Verify the command syntax is correct

For `supabase/migrations/*.sql`:
- [ ] Confirm migration file naming follows `YYYYMMDDHHMMSS_description.sql`
- [ ] Verify SQL syntax is valid
- [ ] Check that RLS policies are included for user data
- [ ] Confirm indexes are appropriate for query patterns

For `.env.example` or documentation:
- [ ] Verify requirements listed actually match the code that uses them
- [ ] Remove requirements that are no longer needed
- [ ] Explain clearly what each requirement is used for

### Example of Correct Process

**Bad (what happened before):**
> "I've updated the deployment to include database migrations. You need SUPABASE_ACCESS_TOKEN and SUPABASE_DB_PASSWORD"
>
> [Later, when things don't work]
>
> "Actually, you only need SUPABASE_ACCESS_TOKEN"

**Good (what should happen):**
> "I've updated deploy.yml. Let me read the file to verify:
>
> [Shows actual file contents with lines 28-39]
>
> The migration step requires SUPABASE_ACCESS_TOKEN because supabase db push authenticates via the CLI API. It does NOT need SUPABASE_DB_PASSWORD because we're not using direct database connections.
>
> Here's where the token is used: [line 37-38 of deploy.yml shows the env var]"

### When You're Skeptical

If I make a claim and you're not sure it's correct, ask directly:
- "Show me the file after the change"
- "Where in the code is this used?"
- "How did you verify this works?"
- "Is that an assumption or a fact?"

These are not adversarial questions - they're quality gates that improve the work product.

## 🚫 Non-Negotiable Rules

These rules are **not suggestions** - they are **mandatory** and must be followed consistently. When any rule is about to be broken, stop and ask for clarification instead.

### 1. Research-First Before Implementation

**ALWAYS research and plan before writing code.** No assumptions allowed.

- ❌ **Never start implementation without research:**
  - Guessing at how Supabase migrations work, then iterating through 5 failures
  - Assuming a tool works a certain way without checking docs
  - "I'll figure it out as I go"

- ✅ **Always do this first:**
  1. Use **Context7 MCP** to query official documentation
  2. Use **WebSearch** if Context7 doesn't have the answer
  3. **Document your findings** before implementing
  4. **Show the user the evidence** and ask if the approach looks right
  5. Only then implement

**Example:**
```
❌ WRONG: "Let me add the migration step to the workflow"
✅ RIGHT: "Let me research how Supabase migrations work in GitHub Actions first. I'll check Context7 for the official docs."
```

### 2. All Test Execution Must Use Subagents

**NEVER run tests directly with Bash. Always use the Task tool with a subagent.**

- ❌ **Never do this:**
  ```bash
  yarn test:playwright
  cd /path && npm test
  ```

- ✅ **Always do this:**
  ```
  Use Task tool with subagent_type: "Bash"
  Provide clear instructions for running tests
  Set run_in_background: true if it takes time
  ```

**Why:** Using subagents provides better isolation, cleaner context, and ensures tests aren't polluting the main conversation.

### 3. Environment Variables Must Be Sourced, Never Exposed

**NEVER put credentials or sensitive values on command lines. Always source them from .env files.**

- ❌ **Never do this:**
  ```bash
  TEST_USER_EMAIL=test@example.com TEST_USER_PASSWORD=secret! yarn test:playwright
  ```

- ✅ **Always do this:**
  ```bash
  source .env.local && yarn test:playwright
  ```

**Why:** Command line history is visible to anyone with shell access. Sourcing files keeps credentials private.

### 4. Evidence-Based Claims Only

**NEVER claim a change is done without proof. Always verify and show evidence.**

- ❌ **Never do this:**
  - "I updated the migration file" (without showing the updated content)
  - "The tests passed" (without showing test output)
  - "The database was migrated successfully" (without querying to verify)

- ✅ **Always do this:**
  1. Make the change
  2. Read the file/output after the change
  3. Show the actual evidence (file contents, query results, test output)
  4. Explain what the evidence proves
  5. Flag any assumptions that weren't verified

### 5. When in Doubt, Ask First

**NEVER proceed with uncertainty. Always ask the user to clarify before acting.**

- ❌ **Never do this:**
  - Assuming you understand what the user wants and proceeding
  - Trying multiple approaches hoping one works
  - Making decisions that aren't explicitly requested

- ✅ **Always do this:**
  - "I'm about to do X. Is that what you want?"
  - "I need clarification on Y before proceeding"
  - "Should I use approach A or approach B?"

### 6. Consistency Matters

**If you broke a rule and the user corrected you, that correction applies going forward. Don't repeat the mistake.**

- ❌ **Never do this:**
  - User says "use subagents for tests"
  - You acknowledge and... then run tests with Bash directly
  - "Oops, I did it again"

- ✅ **Always do this:**
  - User corrects behavior
  - Immediately implement the correction
  - Never break the same rule twice in a session

---

**If any of these rules are about to be broken, STOP and ask for permission first.**

## Project Status

**Phase 3.0 Progress:**
- ✅ Phase 0.5: Testing Infrastructure (Jest + Playwright configured, 36 tests passing)
- ✅ Phase 1: Authentication + Telemetry (Supabase Auth integrated, RLS policies active)
- ✅ Phase 2.0: RBAC + Rate Limiting (Role-based access control foundation, rate limiting hooks)
- ✅ Phase 2.5: SQLite Removal (Supabase-only architecture, dead code cleaned)
- ✅ Phase 3.1: Mowing Screen (CRUD operations, statistics, form validation)
- ✅ Phase 3.2: Watering Screen (Source dropdown, monthly breakdown, statistics)
- ⏳ Phase 3.3: Fertilizer Screen (In progress)
- ⏳ Phase 3.4: Shared Components & E2E Testing (Planned)

**Schedule Status:** 9.5x ahead of plan (53 hours completed vs 199 hour estimate)

## Context7 MCP - Documentation Lookup

This project includes Context7 MCP server for AI-assisted documentation queries.

**Usage in Claude Code:**
```
Query library documentation without context switching:
- /mcp context7 query-docs --library "/supabase/docs" --query "Row Level Security"
- /mcp context7 query-docs --library "/vercel/next.js" --query "authentication patterns"
- /mcp context7 query-docs --library "/mongodb/docs" --query "database indexing"
```

**Common Queries During Development:**
- "How do I set up Supabase RLS policies?"
- "React useEffect cleanup patterns"
- "Jest mocking Supabase client"
- "Playwright E2E test assertions"
- "TypeScript type guards"

**Supported Libraries:**
- Supabase (PostgreSQL, Auth, RLS)
- React & React Native
- Expo & Expo Router
- Jest & Testing Library
- Playwright
- TypeScript
- And many more...

## Important Notes

- App fetches weather for hardcoded city ("Madison"); can be made configurable
- Supabase credentials in `lib/supabase.ts` - use environment variables in production
- All user events automatically filtered by authenticated user ID via Supabase RLS
- App includes accessibility features via haptic feedback (HapticTab)
- Web platform support included via Expo Web + Playwright E2E testing
- Multiple AI coding assistants supported: Claude Code, Cursor, Gemini, OpenCode (see HOW_TO_CONTRIBUTE.md)
