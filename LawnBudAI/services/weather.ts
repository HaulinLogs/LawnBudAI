import { WeatherResponse } from '@/models/weather';

export async function fetchWeather(city: string): Promise<WeatherResponse> {
  const res = await fetch(`https://wttr.in/${city}?format=j1`);
  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
}
