# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LawnBudAI** is a React Native mobile application built with Expo that helps users manage lawn care activities. The app provides tools for tracking mowing, watering, and fertilizing schedules, integrates real-time weather data, and stores historical lawn care events in Supabase PostgreSQL with Row Level Security (RLS) for multi-user data isolation.

## Development Commands

### Running the App
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start the Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web

# Reset project to fresh state (moves current app to app-example)
npm run reset-project
```

### Testing & Quality (TDD Enforcement)
```bash
# Run tests in watch mode (only changed files)
npm run test

# Run tests in debug mode with verbose output
npm run testDebug

# Run all tests once (use before committing)
npm run testFinal

# Generate coverage report
npm run test:coverage

# Update test snapshots
npm run updateSnapshots

# Run E2E tests with Playwright
npm run test:playwright

# Run E2E tests in interactive UI mode
npm run test:playwright:ui

# Run all quality gates (linting, tests, coverage, security)
npm run quality-gates
```

### Linting & Code Quality
```bash
# Check code for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Strict linting (used in CI/CD)
npm run lint:ci
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

## Important Notes

- App fetches weather for hardcoded city ("Madison"); can be made configurable
- Supabase credentials in `lib/supabase.ts` - use environment variables in production
- All user events automatically filtered by authenticated user ID via Supabase RLS
- App includes accessibility features via haptic feedback (HapticTab)
- Web platform support included via Expo Web + Playwright E2E testing
