/**
 * Soil Temperature Service
 *
 * Fetches soil temperature data from the Open-Meteo API using the user's
 * city/state coordinates. Returns current and 7-day forecast data at the
 * surface (0 cm) and shallow root zone (6 cm) depths.
 *
 * Open-Meteo is free for non-commercial use, requires no API key, and
 * provides global coverage with hourly soil temperature forecasts.
 *
 * Source: https://open-meteo.com/en/docs
 * Soil temperature variables: https://open-meteo.com/en/docs#soil_temperature
 */

import { getCityCoordinates } from './cityCoordinates';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 8000;

export interface SoilTempReading {
  /** Date string in YYYY-MM-DD format */
  date: string;
  /** Soil temperature at 0 cm depth in °F */
  tempF_0cm: number;
  /** Soil temperature at 6 cm depth in °F */
  tempF_6cm: number;
}

export interface SoilTempData {
  /** Most recent 6cm reading (best for germination decisions) */
  currentTempF: number;
  /** 7-day daily average soil temps at 6cm */
  forecast: SoilTempReading[];
  /** Rolling 3-day average to smooth out daily swings */
  rollingAvgF: number;
  /** Degrees per day trend (positive = warming, negative = cooling) */
  trendDegPerDay: number;
  /** Latitude used for the query */
  lat: number;
  /** Longitude used for the query */
  lon: number;
}

function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Fetches 7-day hourly soil temperature data and returns daily averages
 * plus trend analysis for overseeding recommendations.
 *
 * @param city  - User's city name
 * @param state - User's 2-letter state code
 */
export async function fetchSoilTemp(city: string, state: string): Promise<SoilTempData> {
  const coords = getCityCoordinates(city, state);
  if (!coords) {
    throw new Error(`No coordinates available for ${city}, ${state}`);
  }

  const params = new URLSearchParams({
    latitude: coords.lat.toString(),
    longitude: coords.lon.toString(),
    hourly: 'soil_temperature_0cm,soil_temperature_6cm',
    temperature_unit: 'celsius', // we convert to F ourselves
    forecast_days: '7',
    timezone: 'auto',
  });

  const url = `${OPEN_METEO_BASE}?${params.toString()}`;

  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API returned ${res.status}`);
  }

  const json = await res.json();
  return parseSoilTempResponse(json, coords.lat, coords.lon);
}

/**
 * Parses the Open-Meteo hourly response into daily averages and trend data.
 * Open-Meteo returns arrays of hourly values aligned by index with the
 * `hourly.time` array.
 */
function parseSoilTempResponse(
  json: {
    hourly: {
      time: string[];
      soil_temperature_0cm: number[];
      soil_temperature_6cm: number[];
    };
  },
  lat: number,
  lon: number,
): SoilTempData {
  const { time, soil_temperature_0cm, soil_temperature_6cm } = json.hourly;

  // Group hourly readings by date and compute daily averages
  const dailyMap: Map<string, { sum0: number; sum6: number; count: number }> = new Map();

  for (let i = 0; i < time.length; i++) {
    const date = time[i].split('T')[0]; // YYYY-MM-DD
    const t0 = soil_temperature_0cm[i];
    const t6 = soil_temperature_6cm[i];

    // Skip nulls (Open-Meteo can return null for out-of-range forecasts)
    if (t0 == null || t6 == null) continue;

    const existing = dailyMap.get(date);
    if (existing) {
      existing.sum0 += t0;
      existing.sum6 += t6;
      existing.count += 1;
    } else {
      dailyMap.set(date, { sum0: t0, sum6: t6, count: 1 });
    }
  }

  const forecast: SoilTempReading[] = Array.from(dailyMap.entries()).map(([date, vals]) => ({
    date,
    tempF_0cm: celsiusToFahrenheit(vals.sum0 / vals.count),
    tempF_6cm: celsiusToFahrenheit(vals.sum6 / vals.count),
  }));

  if (forecast.length === 0) {
    throw new Error('No soil temperature data returned from Open-Meteo');
  }

  const currentTempF = forecast[0].tempF_6cm;

  // Rolling 3-day average (or fewer if less data)
  const rollingDays = Math.min(3, forecast.length);
  const rollingSum = forecast.slice(0, rollingDays).reduce((s, r) => s + r.tempF_6cm, 0);
  const rollingAvgF = Math.round(rollingSum / rollingDays);

  // Linear trend: degrees per day over the available forecast window
  const trendDegPerDay =
    forecast.length >= 2
      ? (forecast[forecast.length - 1].tempF_6cm - forecast[0].tempF_6cm) /
        (forecast.length - 1)
      : 0;

  return { currentTempF, forecast, rollingAvgF, trendDegPerDay: Math.round(trendDegPerDay * 10) / 10, lat, lon };
}
