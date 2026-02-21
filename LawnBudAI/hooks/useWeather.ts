import { useState, useEffect } from 'react';
import { fetchWeather } from '@/services/weather';
import { WeatherResponse } from '@/models/weather';

/**
 * Hook to fetch and manage weather data
 * @param city - City name (e.g., "Madison")
 * @param state - Optional state/region code (e.g., "WI", "CA")
 *               Improves accuracy for US locations and disambiguates city names
 */
export function useWeather(city: string, state?: string) {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeather(city, state);
        setWeather(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, [city, state]);

  return { weather, loading, error };
}
