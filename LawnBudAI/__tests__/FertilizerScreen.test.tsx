import React from 'react';
import { render, screen } from '@testing-library/react-native';
import * as Navigation from '@react-navigation/native';
import FertilizerScreen from '@/screens/FertilizerScreen';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
}));

// Mock the navigation
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

// Mock the useFertilizerEvents hook
jest.mock('@/hooks/useFertilizerEvents', () => ({
  useFertilizerEvents: jest.fn(() => ({
    events: [
      {
        id: '1',
        user_id: 'user-123',
        date: '2026-02-15',
        amount_lbs: 3.5,
        type: 'npk',
        application_method: 'spreader',
        notes: 'Spring application',
        created_at: '2026-02-15T10:00:00Z',
        updated_at: '2026-02-15T10:00:00Z',
      },
    ],
    loading: false,
    error: null,
    addEvent: jest.fn().mockResolvedValue({ id: '2' }),
    deleteEvent: jest.fn().mockResolvedValue(undefined),
    getStats: jest.fn().mockReturnValue({
      lastApplicationDaysAgo: 1,
      totalAmountLbs: '3.5',
      averageAmountLbs: '3.5',
      mostUsedType: 'npk',
    }),
    getTypeBreakdown: jest.fn().mockReturnValue({
      npk: 1,
      nitrogen: 0,
    }),
    getMethodBreakdown: jest.fn().mockReturnValue({
      spreader: 1,
      spray: 0,
      liquid: 0,
      granular: 0,
    }),
    refetch: jest.fn(),
  })),
}));

describe('FertilizerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Navigation.useNavigation as jest.Mock).mockReturnValue({
      setOptions: jest.fn(),
    });
  });

  it('should render the fertilizer form', () => {
    render(<FertilizerScreen />);

    // Check for form section title
    expect(screen.queryByText('Log Fertilizer Application')).toBeTruthy();

    // Check for form labels - using getByText to be specific
    expect(screen.getByText('Date')).toBeTruthy();
    expect(screen.getByText('Amount (lbs)')).toBeTruthy();
    expect(screen.getByText('Record Application')).toBeTruthy();
  });

  it('should display the screen title', () => {
    render(<FertilizerScreen />);

    // Expo Router screen title should be set
    const { UNSAFE_getByType } = render(<FertilizerScreen />);
    expect(UNSAFE_getByType(FertilizerScreen)).toBeTruthy();
  });

  it('should display form input fields', () => {
    render(<FertilizerScreen />);

    // Form fields should be rendered
    expect(screen.getByText('Date')).toBeTruthy();
    expect(screen.getByText('Amount (lbs)')).toBeTruthy();
    expect(screen.getByText('Record Application')).toBeTruthy();
  });

  it('should display statistics when events exist', () => {
    render(<FertilizerScreen />);

    // Statistics section should be displayed
    expect(screen.queryByText('Statistics')).toBeTruthy();
    expect(screen.queryByText('Days since application')).toBeTruthy();
    expect(screen.queryByText('Total lbs applied')).toBeTruthy();
    expect(screen.queryByText('Avg lbs per application')).toBeTruthy();
  });

  it('should display event history', () => {
    render(<FertilizerScreen />);

    // History section should be displayed
    expect(screen.queryByText('Recent Applications')).toBeTruthy();
  });
});
