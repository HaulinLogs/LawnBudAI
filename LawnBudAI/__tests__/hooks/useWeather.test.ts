/**
 * Tests for the useWeather hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useWeather } from '@/hooks/useWeather';

// global.fetch is already mocked to jest.fn() in setup.ts
const mockFetch = global.fetch as jest.Mock;

const mockWeatherResponse = {
  current_condition: [
    {
      temp_F: '72',
      humidity: '55',
      weatherDesc: [{ value: 'Sunny' }],
      weatherCode: '113',
    },
  ],
  weather: [
    {
      date: '2026-01-15',
      maxtempF: '75',
      mintempF: '58',
      hourly: [],
    },
  ],
  nearest_area: [{ areaName: [{ value: 'Madison' }] }],
};

describe('useWeather', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('starts in loading state', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useWeather('Madison', 'WI'));
    expect(result.current.loading).toBe(true);
    expect(result.current.weather).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('resolves with weather data on success', async () => {
    // Direct fetch succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockWeatherResponse,
    });

    const { result } = renderHook(() => useWeather('Madison', 'WI'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.weather).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets error when both direct and proxy fetch fail', async () => {
    // Direct fetch fails
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      // Proxy fetch also fails
      .mockRejectedValueOnce(new Error('Proxy error'));

    const { result } = renderHook(() => useWeather('Madison', 'WI'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.weather).toBeNull();
  });

  it('re-fetches when city changes', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockWeatherResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => mockWeatherResponse });

    const { result, rerender } = renderHook(
      ({ city, state }: { city: string; state: string }) => useWeather(city, state),
      { initialProps: { city: 'Madison', state: 'WI' } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockFetch).toHaveBeenCalledTimes(1);

    rerender({ city: 'Chicago', state: 'IL' });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
