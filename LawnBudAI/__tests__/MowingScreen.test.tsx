import React from 'react';
import { render, screen } from '@testing-library/react-native';
import * as Navigation from '@react-navigation/native';
import MowingScreen from '@/screens/MowingScreen';
import { useMowEvents } from '@/hooks/useMowEvents';

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

// Mock the useMowEvents hook
jest.mock('@/hooks/useMowEvents', () => ({
  useMowEvents: jest.fn(() => ({
    events: [
      {
        id: '1',
        user_id: 'user-123',
        date: '2026-02-15',
        height_inches: 2.5,
        notes: 'Spring cut',
        created_at: '2026-02-15T10:00:00Z',
        updated_at: '2026-02-15T10:00:00Z',
      },
    ],
    loading: false,
    error: null,
    addEvent: jest.fn().mockResolvedValue({ id: '2' }),
    deleteEvent: jest.fn().mockResolvedValue(undefined),
    getStats: jest.fn().mockReturnValue({
      lastMowedDaysAgo: 14,
      averageHeight: '2.50',
    }),
    refetch: jest.fn(),
  })),
}));

describe('MowingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Navigation.useNavigation as jest.Mock).mockReturnValue({
      setOptions: jest.fn(),
    });
  });

  it('should render the mowing form section', () => {
    render(<MowingScreen />);

    expect(screen.queryByText('Log Mowing Event')).toBeTruthy();
  });

  it('should display form field labels and submit button', () => {
    render(<MowingScreen />);

    expect(screen.getByText('Date')).toBeTruthy();
    expect(screen.getByText('Height (inches)')).toBeTruthy();
    expect(screen.getByText('Record Mowing')).toBeTruthy();
  });

  it('should display statistics section when events exist', () => {
    render(<MowingScreen />);

    expect(screen.queryByText('Statistics')).toBeTruthy();
    expect(screen.queryByText('Days since last mow')).toBeTruthy();
    expect(screen.queryByText('Avg height (in)')).toBeTruthy();
  });

  it('should display recent events history section', () => {
    render(<MowingScreen />);

    expect(screen.queryByText('Recent Events')).toBeTruthy();
  });

  it('should not show statistics section when no events exist', () => {
    (useMowEvents as jest.Mock).mockReturnValueOnce({
      events: [],
      loading: false,
      error: null,
      addEvent: jest.fn(),
      deleteEvent: jest.fn(),
      getStats: jest.fn().mockReturnValue({ lastMowedDaysAgo: null, averageHeight: null }),
      refetch: jest.fn(),
    });

    render(<MowingScreen />);

    // Statistics section should be hidden when no events
    expect(screen.queryByText('Statistics')).toBeNull();
  });
});
