/**
 * Tests for the OverseedingCard component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OverseedingCard } from '@/components/OverseedingCard';
import { lightColors } from '@/hooks/useAppTheme';

// Mock Linking so URL opens don't hit native modules
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
}));

const defaultProps = {
  grassType: 'cool_season' as const,
  soilTempData: null,
  soilTempLoading: false,
  soilTempError: null,
  overseedingReminder: null,
  latestSeedEvent: null,
  daysSinceLastSeed: null,
  onLogSeedEvent: jest.fn(),
  seedEventLogging: false,
  colors: lightColors,
};

const soilTempIdeal = {
  currentTempF: 58,
  forecast: [{ date: '2026-09-01', tempF_0cm: 58, tempF_6cm: 58 }],
  rollingAvgF: 58,
  trendDegPerDay: 0,
  lat: 43.07,
  lon: -89.4,
};

const nowReminder = {
  title: 'Overseed Now',
  subtitle: 'Prime overseeding window is open.',
  urgency: 'now' as const,
};

describe('OverseedingCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no relevant content to show', () => {
    const { toJSON } = render(<OverseedingCard {...defaultProps} />);
    expect(toJSON()).toBeNull();
  });

  it('renders when soil temp data is available', () => {
    render(<OverseedingCard {...defaultProps} soilTempData={soilTempIdeal} />);
    expect(screen.getByTestId('overseeding-card')).toBeTruthy();
    expect(screen.getByTestId('soil-temp-section')).toBeTruthy();
  });

  it('shows ideal status for 58°F soil (cool-season optimal range 50–65°F)', () => {
    render(<OverseedingCard {...defaultProps} soilTempData={soilTempIdeal} />);
    expect(screen.getByText('✓ Ideal for overseeding')).toBeTruthy();
  });

  it('shows "too warm" status for soil above 65°F with no cooling trend', () => {
    const tooWarm = { ...soilTempIdeal, currentTempF: 75, trendDegPerDay: 0.1 };
    render(<OverseedingCard {...defaultProps} soilTempData={tooWarm} />);
    expect(screen.getByText('Too warm — wait for cooler soil')).toBeTruthy();
  });

  it('shows "too cold" status for soil below 50°F with no warming trend', () => {
    const tooCold = { ...soilTempIdeal, currentTempF: 42, trendDegPerDay: 0 };
    render(<OverseedingCard {...defaultProps} soilTempData={tooCold} />);
    expect(screen.getByText('Too cold — wait for warmer soil')).toBeTruthy();
  });

  it('shows loading indicator when soil temp is loading', () => {
    render(<OverseedingCard {...defaultProps} soilTempLoading />);
    expect(screen.getByTestId('soil-temp-loading')).toBeTruthy();
  });

  it('shows error box when soil temp fetch failed', () => {
    render(<OverseedingCard {...defaultProps} soilTempError="Network error" />);
    expect(screen.getByTestId('soil-temp-error')).toBeTruthy();
  });

  it('shows overseeding reminder when in season', () => {
    render(<OverseedingCard {...defaultProps} overseedingReminder={nowReminder} />);
    expect(screen.getByTestId('overseeding-reminder')).toBeTruthy();
    expect(screen.getByText('Overseed Now')).toBeTruthy();
  });

  it('shows "I Seeded Today" button when reminder urgency is "now" and soil is ideal', () => {
    render(
      <OverseedingCard
        {...defaultProps}
        soilTempData={soilTempIdeal}
        overseedingReminder={nowReminder}
      />,
    );
    expect(screen.getByTestId('log-seed-button')).toBeTruthy();
  });

  it('calls onLogSeedEvent when seed button is pressed', () => {
    const onLogSeedEvent = jest.fn();
    render(
      <OverseedingCard
        {...defaultProps}
        soilTempData={soilTempIdeal}
        overseedingReminder={nowReminder}
        onLogSeedEvent={onLogSeedEvent}
      />,
    );
    fireEvent.press(screen.getByTestId('log-seed-button'));
    expect(onLogSeedEvent).toHaveBeenCalledTimes(1);
  });

  it('shows watering reminder when user seeded 3 days ago', () => {
    render(
      <OverseedingCard
        {...defaultProps}
        latestSeedEvent={{
          id: 'evt-001',
          user_id: 'user-123',
          date: '2026-09-01',
          grass_seed_type: 'perennial_ryegrass',
          created_at: '2026-09-01T10:00:00Z',
          updated_at: '2026-09-01T10:00:00Z',
        }}
        daysSinceLastSeed={3}
      />,
    );
    expect(screen.getByTestId('watering-reminder')).toBeTruthy();
  });

  it('shows germination info within 60 days of seeding', () => {
    render(
      <OverseedingCard
        {...defaultProps}
        latestSeedEvent={{
          id: 'evt-001',
          user_id: 'user-123',
          date: '2026-09-01',
          grass_seed_type: 'tall_fescue',
          created_at: '2026-09-01T10:00:00Z',
          updated_at: '2026-09-01T10:00:00Z',
        }}
        daysSinceLastSeed={5}
      />,
    );
    expect(screen.getByTestId('germination-info')).toBeTruthy();
  });

  it('shows warming trend indicator', () => {
    const warming = { ...soilTempIdeal, currentTempF: 58, trendDegPerDay: 1.2 };
    render(<OverseedingCard {...defaultProps} soilTempData={warming} />);
    expect(screen.getByText('↑ Warming 1.2°F/day')).toBeTruthy();
  });

  it('shows cooling trend indicator', () => {
    const cooling = { ...soilTempIdeal, currentTempF: 58, trendDegPerDay: -0.8 };
    render(<OverseedingCard {...defaultProps} soilTempData={cooling} />);
    expect(screen.getByText('↓ Cooling 0.8°F/day')).toBeTruthy();
  });

  it('expands and hides expert advice links', () => {
    render(
      <OverseedingCard
        {...defaultProps}
        overseedingReminder={{ title: 'Soon', subtitle: 'Prep now.', urgency: 'soon' }}
      />,
    );
    expect(screen.queryByTestId('advice-links')).toBeNull();
    fireEvent.press(screen.getByTestId('advice-links-toggle'));
    expect(screen.getByTestId('advice-links')).toBeTruthy();
    fireEvent.press(screen.getByTestId('advice-links-toggle'));
    expect(screen.queryByTestId('advice-links')).toBeNull();
  });

  it('shows warm-season optimal temp range for warm_season grass', () => {
    render(
      <OverseedingCard
        {...defaultProps}
        grassType="warm_season"
        soilTempData={{ ...soilTempIdeal, currentTempF: 72, trendDegPerDay: 0 }}
      />,
    );
    expect(screen.getByText('Optimal: 65–85°F for warm-season seed')).toBeTruthy();
  });
});
