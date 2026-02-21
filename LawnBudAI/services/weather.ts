import { WeatherResponse } from '@/models/weather';
import { trackWeatherError } from '@/lib/errorTracking';

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
    const res = await fetch(directUrl);

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
    const isCORSError = errorMessage.includes('Failed to fetch') ||
                       errorMessage.includes('CORS') ||
                       errorMessage.includes('NetworkError');

    console.warn('Direct weather fetch failed, trying CORS proxy...', {
      message: errorMessage,
      isCORSError,
      location,
    });

    // Track the error for monitoring
    trackWeatherError(errorMessage, location);

    // Fallback: Use CORS proxy
    if (isCORSError) {
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(directUrl)}`;
        console.log(`Trying CORS proxy: ${proxyUrl}`);
        const proxyRes = await fetch(proxyUrl);

        if (!proxyRes.ok) {
          throw new Error(`CORS proxy returned ${proxyRes.status}`);
        }

        const proxyData = await proxyRes.json();
        const data = JSON.parse(proxyData.contents);
        console.log('Weather data from proxy:', data);
        console.log('Successfully retrieved weather via fallback proxy');
        return data;
      } catch (proxyError: any) {
        console.error('CORS proxy also failed:', proxyError);
        trackWeatherError(`Fallback CORS proxy failed: ${proxyError.message}`, location);
        throw new Error('Unable to reach weather service. Please check your internet connection.');
      }
    }

    throw new Error(`Weather service error: ${errorMessage}`);
  }
}
