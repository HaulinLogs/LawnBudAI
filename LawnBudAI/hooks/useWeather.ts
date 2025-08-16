import { useState, useEffect } from 'react';
import { fetchWeather } from '@/services/weather';
import { WeatherResponse } from '@/models/weather';

export function useWeather(city: string) {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeather(city);
        setWeather(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, [city]);

  return { weather, loading, error };
}
