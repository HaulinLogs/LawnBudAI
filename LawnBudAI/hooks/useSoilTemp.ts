import { useState, useEffect } from 'react';
import { fetchSoilTemp, type SoilTempData } from '@/services/soilTemp';

export interface SoilTempState {
  data: SoilTempData | null;
  loading: boolean;
  error: string | null;
}

/**
 * React hook that fetches soil temperature data from Open-Meteo for the
 * given city and state. Re-fetches when city or state changes.
 *
 * Only fetches when both city and state are non-empty.
 */
export function useSoilTemp(city: string, state: string): SoilTempState {
  const [data, setData] = useState<SoilTempData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city || !state) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchSoilTemp(city, state);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch soil temperature';
          setError(msg);
          console.error('[useSoilTemp] error:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [city, state]);

  return { data, loading, error };
}
