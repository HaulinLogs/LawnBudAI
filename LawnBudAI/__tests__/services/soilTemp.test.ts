/**
 * Tests for the soil temperature service
 */

import { getCityCoordinates } from '@/services/cityCoordinates';
import { fetchSoilTemp } from '@/services/soilTemp';

// Mock global fetch (already set to jest.fn() in setup.ts)
const mockFetch = global.fetch as jest.Mock;

// Build a minimal Open-Meteo hourly response
function makeHourlyTimes(days: number): string[] {
  const times: string[] = [];
  const base = new Date('2026-09-01T00:00:00');
  for (let d = 0; d < days; d++) {
    for (let h = 0; h < 24; h++) {
      const t = new Date(base);
      t.setDate(base.getDate() + d);
      t.setHours(h);
      // Format as "YYYY-MM-DDTHH:00"
      const iso = t.toISOString().slice(0, 16);
      times.push(iso);
    }
  }
  return times;
}

function buildOpenMeteoResponse(temps0cm: number[], temps6cm: number[], times: string[]) {
  return {
    hourly: {
      time: times,
      soil_temperature_0cm: temps0cm,
      soil_temperature_6cm: temps6cm,
    },
  };
}

describe('fetchSoilTemp', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches and parses soil temperature data for Madison, WI', async () => {
    // 2 days × 24 hours, all at 14°C (→ 57°F after rounding)
    const times = makeHourlyTimes(2);
    const temps = Array(48).fill(14);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => buildOpenMeteoResponse(temps, temps, times),
    });

    const result = await fetchSoilTemp('Madison', 'WI');

    expect(result.currentTempF).toBe(57); // 14°C → (14*9/5+32)=57.2°F → 57°F
    expect(result.forecast).toHaveLength(2);
    expect(result.lat).toBeCloseTo(43.07, 1);
    expect(result.lon).toBeCloseTo(-89.4, 1);
    expect(typeof result.trendDegPerDay).toBe('number');
    expect(result.rollingAvgF).toBe(57);
  });

  it('computes warming trend correctly (day 2 warmer than day 1)', async () => {
    const times = makeHourlyTimes(2);
    // Day 1 at 10°C (50°F), day 2 at 20°C (68°F)
    const temps0cm = [...Array(24).fill(10), ...Array(24).fill(20)];
    const temps6cm = [...Array(24).fill(10), ...Array(24).fill(20)];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => buildOpenMeteoResponse(temps0cm, temps6cm, times),
    });

    const result = await fetchSoilTemp('Madison', 'WI');

    // Trend should be positive (warming)
    expect(result.trendDegPerDay).toBeGreaterThan(0);
  });

  it('throws for unknown city+state (no coordinates)', async () => {
    await expect(fetchSoilTemp('Fakeville', 'ZZ')).rejects.toThrow('No coordinates available');
  });

  it('throws when Open-Meteo returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({}),
    });

    await expect(fetchSoilTemp('Madison', 'WI')).rejects.toThrow('Open-Meteo API returned 429');
  });

  it('throws when no hourly data is returned', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        hourly: { time: [], soil_temperature_0cm: [], soil_temperature_6cm: [] },
      }),
    });

    await expect(fetchSoilTemp('Madison', 'WI')).rejects.toThrow('No soil temperature data');
  });
});

describe('getCityCoordinates integration with soilTemp', () => {
  it('provides non-null coordinates for all major states', () => {
    const states = ['WI', 'CA', 'TX', 'FL', 'NY', 'WA', 'CO'];
    for (const state of states) {
      const coords = getCityCoordinates('Anywhere', state);
      expect(coords).not.toBeNull();
      expect(coords!.lat).toBeGreaterThan(18); // All US states above 18°N (Hawaii min)
      expect(coords!.lat).toBeLessThan(72);    // All US states below 72°N (Alaska max)
    }
  });
});
