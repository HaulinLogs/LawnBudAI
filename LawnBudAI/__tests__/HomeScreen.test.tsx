import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '@/screens/HomeScreen';
import { useWeather } from '@/hooks/useWeather';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTodo } from '@/hooks/useTodo';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
}));

// Mock ParallaxScrollView — renders children directly so sections are testable
jest.mock('@/components/ParallaxScrollView', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return function MockParallaxScrollView({ children }: { children: React.ReactNode }) {
    return <View testID="parallax-scroll-view">{children}</View>;
  };
});

// Mock WeatherCard — renders a sentinel so we can assert it appears
jest.mock('@/components/WeatherCard', () => ({
  WeatherCard: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require('react-native');
    return <Text testID="weather-card">WeatherCard</Text>;
  },
}));

// Mock UsdaZoneCard — renders a sentinel so the card is detectable in tests
jest.mock('@/components/UsdaZoneCard', () => ({
  UsdaZoneCard: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require('react-native');
    return <Text testID="usda-zone-card">UsdaZoneCard</Text>;
  },
}));

// Mock IconSymbol
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

// Mock useAppTheme
jest.mock('@/hooks/useAppTheme', () => {
  const { lightColors } = jest.requireActual('@/hooks/useAppTheme');
  return {
    useAppTheme: jest.fn(() => lightColors),
    lightColors,
  };
});

// Mock data hooks
jest.mock('@/hooks/useWeather', () => ({ useWeather: jest.fn() }));
jest.mock('@/hooks/useUserPreferences', () => ({ useUserPreferences: jest.fn() }));
jest.mock('@/hooks/useTodo', () => ({ useTodo: jest.fn() }));
jest.mock('@/hooks/useFertilizerEvents', () => ({
  useFertilizerEvents: jest.fn(() => ({ events: [], loading: false, error: null })),
}));
jest.mock('@/hooks/useUsdaZone', () => ({
  useUsdaZone: jest.fn(() => ({
    zoneInfo: {
      zone: 5,
      subzone: 'b',
      label: 'Zone 5b',
      description: 'Northern cool – cold winters, ~160 frost-free days',
      climateCategory: 'cool',
      typicalFirstFrost: 'Mid-October',
      typicalLastFrost: 'Mid-April',
      minTempRange: '-20 to -10°F',
      recommendedGrassType: 'cool_season',
    },
    season: 'spring',
    fertilizerRecommendation: {
      npk: '15-0-8',
      productType: 'Balanced slow-release',
      ratePerThousandSqFt: 3.5,
      suggestedTotalLbs: null,
      proTip: 'Light spring feeding only.',
      seasonStatus: 'active',
      daysUntilDue: 0,
      timingLabel: 'No history — first application recommended',
    },
  })),
}));

const mockUseWeather = useWeather as jest.Mock;
const mockUseUserPreferences = useUserPreferences as jest.Mock;
const mockUseTodo = useTodo as jest.Mock;

const defaultPrefs = {
  city: 'Chicago',
  state: 'IL',
  grass_type: 'cool_season',
  lawn_size_sqft: 5000,
};

const defaultTodos = {
  mowingTodo: { name: 'Mow weekly', text: 'Keep grass at 3 inches.' },
  wateringTodo: { name: 'Water 3x/week', text: 'Deep watering recommended.' },
  fertilizerTodo: { name: 'No fertilizer yet', text: 'Wait until spring.' },
  overseedingReminder: null,
  loading: false,
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseWeather.mockReturnValue({ weather: null, loading: false, error: null });
    mockUseUserPreferences.mockReturnValue({ prefs: defaultPrefs, loading: false, save: jest.fn() });
    mockUseTodo.mockReturnValue(defaultTodos);
  });

  describe('Weather section loading state', () => {
    it('shows weather loading indicator while weather is loading', () => {
      mockUseWeather.mockReturnValue({ weather: null, loading: true, error: null });

      render(<HomeScreen />);

      expect(screen.getByTestId('weather-loading')).toBeTruthy();
      expect(screen.queryByTestId('weather-card')).toBeNull();
    });

    it('shows weather loading indicator while prefs are loading', () => {
      mockUseUserPreferences.mockReturnValue({
        prefs: { city: '', state: '', grass_type: 'cool_season', lawn_size_sqft: 5000 },
        loading: true,
        save: jest.fn(),
      });

      render(<HomeScreen />);

      expect(screen.getByTestId('weather-loading')).toBeTruthy();
    });
  });

  describe('Weather section error state', () => {
    it('shows inline weather error within the card, not a full-page block', () => {
      mockUseWeather.mockReturnValue({
        weather: null,
        loading: false,
        error: 'Unable to reach weather service',
      });

      render(<HomeScreen />);

      expect(screen.getByTestId('weather-error')).toBeTruthy();
      expect(screen.getByText('Weather Unavailable')).toBeTruthy();
      expect(screen.getByText('Unable to reach weather service')).toBeTruthy();
    });

    it('still renders todo and reminder sections when weather errors', () => {
      mockUseWeather.mockReturnValue({ weather: null, loading: false, error: 'Network error' });

      render(<HomeScreen />);

      expect(screen.getByText('Mowing')).toBeTruthy();
      expect(screen.getByText('Watering')).toBeTruthy();
      expect(screen.getByText('Fertilizing')).toBeTruthy();
      expect(screen.getByText('Upcoming Reminders')).toBeTruthy();
    });
  });

  describe('Todo section loading state', () => {
    it('shows todo loading indicators while prefs are loading', () => {
      mockUseUserPreferences.mockReturnValue({
        prefs: defaultPrefs,
        loading: true,
        save: jest.fn(),
      });

      render(<HomeScreen />);

      expect(screen.getByTestId('todos-loading')).toBeTruthy();
      expect(screen.queryByText('Mowing')).toBeNull();
      expect(screen.queryByText('Watering')).toBeNull();
      expect(screen.queryByText('Fertilizing')).toBeNull();
    });

    it('shows todo loading indicators while todos are computing', () => {
      mockUseTodo.mockReturnValue({
        mowingTodo: null,
        wateringTodo: null,
        fertilizerTodo: null,
        overseedingReminder: null,
        loading: true,
      });

      render(<HomeScreen />);

      expect(screen.getByTestId('todos-loading')).toBeTruthy();
    });

    it('shows reminders loading indicator while todos are computing', () => {
      mockUseTodo.mockReturnValue({
        mowingTodo: null,
        wateringTodo: null,
        fertilizerTodo: null,
        overseedingReminder: null,
        loading: true,
      });

      render(<HomeScreen />);

      expect(screen.getByTestId('reminders-loading')).toBeTruthy();
    });
  });

  describe('Successful render', () => {
    it('renders the WeatherCard when weather data is available', () => {
      mockUseWeather.mockReturnValue({
        weather: {
          current_condition: [{ weatherDesc: [{ value: 'Sunny' }], temp_F: '72' }],
          weather: [],
        },
        loading: false,
        error: null,
      });

      render(<HomeScreen />);

      expect(screen.getByTestId('weather-card')).toBeTruthy();
    });

    it('renders "Weather not available" when weather resolves to null', () => {
      render(<HomeScreen />);

      expect(screen.getByText('Weather not available...')).toBeTruthy();
    });

    it('renders all three todo status cards when todos are loaded', () => {
      render(<HomeScreen />);

      expect(screen.getByText('Mowing')).toBeTruthy();
      expect(screen.getByText('Watering')).toBeTruthy();
      expect(screen.getByText('Fertilizing')).toBeTruthy();
    });

    it('renders the Upcoming Reminders section heading', () => {
      render(<HomeScreen />);

      expect(screen.getByText('Upcoming Reminders')).toBeTruthy();
    });

    it('shows "No reminders scheduled" when overseedingReminder is null', () => {
      render(<HomeScreen />);

      expect(screen.getByText('No reminders scheduled')).toBeTruthy();
    });
  });

  describe('Overseeding reminder', () => {
    it('renders overseeding reminder title and subtitle when urgency is now', () => {
      mockUseTodo.mockReturnValue({
        ...defaultTodos,
        overseedingReminder: {
          title: 'Time to Overseed',
          subtitle: 'Fall is the ideal time to overseed cool-season grasses.',
          urgency: 'now',
        },
      });

      render(<HomeScreen />);

      expect(screen.getByText('Time to Overseed')).toBeTruthy();
      expect(
        screen.getByText('Fall is the ideal time to overseed cool-season grasses.'),
      ).toBeTruthy();
    });

    it('renders an upcoming reminder with "soon" urgency', () => {
      mockUseTodo.mockReturnValue({
        ...defaultTodos,
        overseedingReminder: {
          title: 'Upcoming Overseeding Window',
          subtitle: 'Overseed in about 4 weeks for best results.',
          urgency: 'soon',
        },
      });

      render(<HomeScreen />);

      expect(screen.getByText('Upcoming Overseeding Window')).toBeTruthy();
    });
  });

  describe('USDA Zone Card', () => {
    it('renders the UsdaZoneCard when prefs are loaded', () => {
      render(<HomeScreen />);
      expect(screen.getByTestId('usda-zone-card')).toBeTruthy();
    });
  });

  describe('useTodo receives correct grass type', () => {
    it('calls useTodo with the grass_type from user prefs', () => {
      mockUseUserPreferences.mockReturnValue({
        prefs: { ...defaultPrefs, city: 'Atlanta', state: 'GA', grass_type: 'warm_season' },
        loading: false,
        save: jest.fn(),
      });

      render(<HomeScreen />);

      expect(mockUseTodo).toHaveBeenCalledWith('warm_season');
    });
  });
});
