# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LawnBudAI** is a React Native mobile application built with Expo that helps users manage lawn care activities. The app provides tools for tracking mowing, watering, and fertilizing schedules, integrates real-time weather data, and stores historical lawn care events in a local SQLite database.

## Development Commands

```bash
# Install dependencies
npm install

# Start the Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web

# Lint code with ESLint
npm run lint

# Reset project to fresh state (moves current app to app-example)
npm run reset-project
```

## Project Architecture

### High-Level Structure

The app follows Expo Router's file-based routing with the following architectural pattern:

- **Routing**: File-based routing via Expo Router in the `app/` directory
- **UI Components**: Reusable components in `components/`
- **Data Fetching**: Custom React hooks (`useWeather`, `useTodo`) for data management
- **External Data**: Weather API integration via `services/weather.ts`
- **Local Storage**: SQLite database for lawn care event history via `database/init.ts`
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

3. **Database**:
   - SQLite database initialized via `database/init.ts`
   - Tables: `mow_events`, `water_events`, `weather_history`, `fertilizer_events`, `soil_samples`
   - Uses expo-sqlite for data persistence

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
- **expo-sqlite**: Local database (15.2.14)
- **Axios**: HTTP client (1.11.0)
- **@react-navigation**: Navigation system with native and bottom tabs
- **@expo/vector-icons**: Icon system with Ionicons
- **ESLint**: Code linting via expo config

## Important Architectural Patterns

### Custom Hooks
The app uses custom React hooks for data management:
- `useWeather(city)`: Fetches weather data with loading/error states
- `useTodo(name)`: Manages lawn care task data
- `useColorScheme()`: Detects and provides dark/light mode support
- `useThemeColor()`: Returns color values based on theme

### Component Organization
- Functional components with React Hooks
- Styled using React Native StyleSheet
- Reusable UI components accept props for configuration
- Separate `.styles.ts` files for component-specific styling

### Database Integration
- SQL initialization only; actual data operations not yet fully implemented
- Tables designed for lawn care event tracking and history
- Future work: Connect hooks to database operations

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

## Notes

- App currently uses hardcoded city ("Madison") for weather; can be made configurable
- Todo data is mocked in `useTodo` hook; connect to database or API
- App includes accessibility features via haptic feedback (HapticTab)
- Support for web platform included (expo web)
