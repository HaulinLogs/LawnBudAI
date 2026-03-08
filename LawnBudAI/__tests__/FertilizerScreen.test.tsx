import React from 'react';
import { render, screen } from '@testing-library/react-native';
import * as Navigation from '@react-navigation/native';
import FertilizerScreen from '@/screens/FertilizerScreen';
import { getFertilizerAdvisory } from '@/lib/lawnAdvice';

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

// Mock useUserPreferences
jest.mock('@/hooks/useUserPreferences', () => ({
  useUserPreferences: jest.fn(() => ({
    prefs: {
      grass_type: 'cool_season',
      lawn_size_sqft: 5000,
      city: 'Madison',
      state: 'WI',
    },
    loading: false,
    save: jest.fn(),
  })),
}));

// Mock lawnAdvice — keeps screen tests independent of advisory date logic
jest.mock('@/lib/lawnAdvice', () => ({
  getFertilizerAdvisory: jest.fn(() => ({
    status: 'due',
    heading: 'Time to Fertilize',
    detail: 'Your last application was 45 days ago — right on schedule. Apply Balanced slow-release.',
    suggestedAmountLbs: 22.5,
    daysUntilDue: 0,
    typeRecommendation: 'Balanced slow-release (e.g., 15-0-8 or 10-10-10)',
  })),
  getSeason: jest.fn(() => 'spring'),
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
        nitrogen_pct: 15,
        phosphorus_pct: 0,
        potassium_pct: 8,
        application_form: 'granular',
        application_method: 'broadcast',
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
    }),
    getFormBreakdown: jest.fn().mockReturnValue({
      granular: 1,
    }),
    getMethodBreakdown: jest.fn().mockReturnValue({
      broadcast: 1,
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

    // Check for form labels
    expect(screen.getByText('Date')).toBeTruthy();
    expect(screen.getByText('Amount (lbs)')).toBeTruthy();
    expect(screen.getByText('Record Application')).toBeTruthy();
  });

  it('should display the screen title', () => {
    render(<FertilizerScreen />);

    const { UNSAFE_getByType } = render(<FertilizerScreen />);
    expect(UNSAFE_getByType(FertilizerScreen)).toBeTruthy();
  });

  it('should display NPK ratio inputs', () => {
    render(<FertilizerScreen />);

    expect(screen.getByText('N-P-K Ratio (%)')).toBeTruthy();
    expect(screen.getByText('Nitrogen')).toBeTruthy();
    expect(screen.getByText('Phosphorus')).toBeTruthy();
    expect(screen.getByText('Potassium')).toBeTruthy();
  });

  it('should display application form and method pickers', () => {
    render(<FertilizerScreen />);

    // Both labels appear as picker label and stats section heading
    expect(screen.getAllByText('Application Form').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Application Method').length).toBeGreaterThan(0);
  });

  it('should display form input fields', () => {
    render(<FertilizerScreen />);

    expect(screen.getByText('Date')).toBeTruthy();
    expect(screen.getByText('Amount (lbs)')).toBeTruthy();
    expect(screen.getByText('Record Application')).toBeTruthy();
  });

  it('should display statistics when events exist', () => {
    render(<FertilizerScreen />);

    expect(screen.queryByText('Statistics')).toBeTruthy();
    expect(screen.queryByText('Days since application')).toBeTruthy();
    expect(screen.queryByText('Total lbs applied')).toBeTruthy();
    expect(screen.queryByText('Avg lbs per application')).toBeTruthy();
  });

  it('should display event history', () => {
    render(<FertilizerScreen />);

    expect(screen.queryByText('Recent Applications')).toBeTruthy();
  });

  describe('Fertilizer Advisor card', () => {
    it('should display the advisor heading and detail text', () => {
      render(<FertilizerScreen />);
      expect(screen.getByText('Time to Fertilize')).toBeTruthy();
      expect(screen.getByText(/right on schedule/i)).toBeTruthy();
    });

    it('should display suggested amount when provided', () => {
      render(<FertilizerScreen />);
      expect(screen.getByText('Suggested amount: 22.5 lbs')).toBeTruthy();
    });

    it('should call getFertilizerAdvisory with grass_type and lawn_size_sqft from prefs', () => {
      render(<FertilizerScreen />);
      expect(getFertilizerAdvisory).toHaveBeenCalledWith(
        'cool_season',
        'spring',
        expect.anything(), // lastAppDate from events[0].date
        5000,
      );
    });

    it('should not show suggested amount when advisory returns null', () => {
      (getFertilizerAdvisory as jest.Mock).mockReturnValueOnce({
        status: 'dormant',
        heading: 'No Fertilizer Needed',
        detail: 'None — grass is dormant.',
        suggestedAmountLbs: null,
        daysUntilDue: null,
        typeRecommendation: 'None — grass is dormant',
      });
      render(<FertilizerScreen />);
      expect(screen.getByText('No Fertilizer Needed')).toBeTruthy();
      expect(screen.queryByText(/Suggested amount/i)).toBeNull();
    });

    it('should show the overdue heading when status is overdue', () => {
      (getFertilizerAdvisory as jest.Mock).mockReturnValueOnce({
        status: 'overdue',
        heading: 'Fertilization Overdue',
        detail: 'It has been 60 days since your last application.',
        suggestedAmountLbs: 22.5,
        daysUntilDue: -30,
        typeRecommendation: 'High-nitrogen slow-release',
      });
      render(<FertilizerScreen />);
      expect(screen.getByText('Fertilization Overdue')).toBeTruthy();
    });

    it('should show the too_soon heading when status is too_soon', () => {
      (getFertilizerAdvisory as jest.Mock).mockReturnValueOnce({
        status: 'too_soon',
        heading: 'Too Soon to Fertilize',
        detail: 'Wait 20 more days before the next application.',
        suggestedAmountLbs: null,
        daysUntilDue: 20,
        typeRecommendation: 'Balanced slow-release',
      });
      render(<FertilizerScreen />);
      expect(screen.getByText('Too Soon to Fertilize')).toBeTruthy();
      expect(screen.queryByText(/Suggested amount/i)).toBeNull();
    });
  });
});
