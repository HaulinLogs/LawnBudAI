import { WeatherResponse } from '@/models/weather';
import { trackWeatherError } from '@/lib/errorTracking';

const WEATHER_TIMEOUT_MS = 8000;

function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Fetch weather data from wttr.in API
 * @param city - City name (e.g., "Madison")
 * @param state - State code for US locations (e.g., "WI", "CA")
 *               Helps disambiguate cities with same names (Madison, WI vs Madison, AL)
 */
export async function fetchWeather(city: string, state?: string): Promise<WeatherResponse> {
  // Build location string: "city,state" for US, or just "city" for other countries
  const location = state ? `${city},${state}` : city;

  // Try direct API first
  const directUrl = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;

  try {
    console.log(`Fetching weather for ${city} from: ${directUrl}`);
    const res = await fetchWithTimeout(directUrl);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Weather API returned ${res.status}:`, errorText);
      throw new Error(`Weather service returned ${res.status}`);
    }

    const data = await res.json();
    console.log('Weather data received:', data);
    return data;
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';

    console.warn('Direct weather fetch failed, trying CORS proxy...', {
      message: errorMessage,
      location,
    });

    // Track the error for monitoring
    trackWeatherError(errorMessage, location);

    // Fallback: Use CORS proxy for any failure (CORS block, server error, timeout, etc.)
    // corsproxy.io returns the raw response body, unlike allorigins.win which wraps in JSON
    try {
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(directUrl)}`;
      console.log(`Trying CORS proxy: ${proxyUrl}`);
      const proxyRes = await fetchWithTimeout(proxyUrl);

      if (!proxyRes.ok) {
        throw new Error(`CORS proxy returned ${proxyRes.status}`);
      }

      const data = await proxyRes.json();
      console.log('Weather data from proxy:', data);
      console.log('Successfully retrieved weather via fallback proxy');
      return data;
    } catch (proxyError: any) {
      console.error('CORS proxy also failed:', proxyError);
      trackWeatherError(`Fallback CORS proxy failed: ${proxyError.message}`, location);
      throw new Error('Unable to reach weather service. Please check your internet connection.');
    }
  }
}
