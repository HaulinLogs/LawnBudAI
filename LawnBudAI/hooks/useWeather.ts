import { useEffect, useState } from 'react';
import { fetchWeather } from '@/services/weather';
import { WeatherResponse } from '@/models/weather';

export function useWeather(city: string) {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchWeather(city)
      .then(setWeather)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [city]);

  return { weather, loading, error };
}
