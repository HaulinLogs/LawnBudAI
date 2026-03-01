import React from 'react';
import { render, screen } from '@testing-library/react-native';
import * as Navigation from '@react-navigation/native';
import WateringScreen from '@/screens/WateringScreen';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => 'Icon');

// Mock the useWaterEvents hook
jest.mock('@/hooks/useWaterEvents', () => ({
  useWaterEvents: jest.fn(() => ({
    events: [
      {
        id: '1',
        user_id: 'user-123',
        date: '2026-02-15',
        amount_inches: 0.5,
        source: 'sprinkler',
        notes: null,
        created_at: '2026-02-15T10:00:00Z',
        updated_at: '2026-02-15T10:00:00Z',
      },
    ],
    loading: false,
    error: null,
    addEvent: jest.fn().mockResolvedValue({ id: '2' }),
    deleteEvent: jest.fn().mockResolvedValue(undefined),
    getStats: jest.fn().mockReturnValue({
      lastWateredDaysAgo: 7,
      totalInchesThisMonth: '0.5',
      averageInchesPerWatering: '0.5',
    }),
    getSourceBreakdown: jest.fn().mockReturnValue({
      sprinkler: 1,
      manual: 0,
      rain: 0,
    }),
    refetch: jest.fn(),
  })),
}));

describe('WateringScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Navigation.useNavigation as jest.Mock).mockReturnValue({
      setOptions: jest.fn(),
    });
  });

  it('should render the watering form section', () => {
    render(<WateringScreen />);

    expect(screen.queryByText('Log Watering Event')).toBeTruthy();
  });

  it('should display form field labels and submit button', () => {
    render(<WateringScreen />);

    expect(screen.getByText('Date')).toBeTruthy();
    expect(screen.getByText('Amount (inches)')).toBeTruthy();
    expect(screen.getByText('Record Watering')).toBeTruthy();
  });

  it('should display statistics section when events exist', () => {
    render(<WateringScreen />);

    expect(screen.queryByText('Statistics')).toBeTruthy();
    expect(screen.queryByText('Days since watering')).toBeTruthy();
    expect(screen.queryByText('Inches this month')).toBeTruthy();
    expect(screen.queryByText('Avg inches')).toBeTruthy();
  });

  it('should display source breakdown section when events exist', () => {
    render(<WateringScreen />);

    expect(screen.queryByText('Source Breakdown')).toBeTruthy();
    expect(screen.queryByText('Sprinkler')).toBeTruthy();
    expect(screen.queryByText('Manual')).toBeTruthy();
    expect(screen.queryByText('Rain')).toBeTruthy();
  });

  it('should display recent events history section', () => {
    render(<WateringScreen />);

    expect(screen.queryByText('Recent Events')).toBeTruthy();
  });

  it('should not show statistics or source breakdown when no events exist', () => {
    const { useWaterEvents } = require('@/hooks/useWaterEvents');
    useWaterEvents.mockReturnValueOnce({
      events: [],
      loading: false,
      error: null,
      addEvent: jest.fn(),
      deleteEvent: jest.fn(),
      getStats: jest.fn().mockReturnValue({
        lastWateredDaysAgo: null,
        totalInchesThisMonth: '0.0',
        averageInchesPerWatering: null,
      }),
      getSourceBreakdown: jest.fn().mockReturnValue({ sprinkler: 0, manual: 0, rain: 0 }),
      refetch: jest.fn(),
    });

    render(<WateringScreen />);

    // Statistics and source breakdown should be hidden when no events
    expect(screen.queryByText('Statistics')).toBeNull();
    expect(screen.queryByText('Source Breakdown')).toBeNull();
  });
});
