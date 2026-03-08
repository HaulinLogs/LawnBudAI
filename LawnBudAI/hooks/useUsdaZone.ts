/**
 * useUsdaZone hook
 *
 * Derives the user's USDA hardiness zone from their city/state preferences
 * and computes a zone-aware fertilizer recommendation based on the current
 * season and their fertilizer application history.
 */

import { useMemo } from 'react';
import {
  getUsdaZone,
  getZoneFertilizerRecommendation,
  type UsdaZoneInfo,
  type NpkRecommendation,
} from '@/services/usdaZone';
import { getSeason, type Season } from '@/lib/lawnAdvice';

export interface UsdaZoneState {
  zoneInfo: UsdaZoneInfo | null;
  season: Season;
  fertilizerRecommendation: NpkRecommendation | null;
}

/**
 * Returns USDA zone info and a zone-aware fertilizer recommendation
 * for the given city, state, and fertilizer history.
 *
 * @param city            - User's city from preferences
 * @param state           - User's state (2-letter code) from preferences
 * @param lastAppDate     - ISO date string of the most recent fertilizer application, or undefined
 * @param lawnSizeSqFt    - Lawn size in square feet, or null if not set
 * @param date            - Override for "today" (useful in tests)
 */
export function useUsdaZone(
  city: string,
  state: string,
  lastAppDate?: string,
  lawnSizeSqFt?: number | null,
  date: Date = new Date(),
): UsdaZoneState {
  const season = useMemo(() => getSeason(date), [date]);

  const zoneInfo = useMemo(() => {
    if (!city || !state) return null;
    return getUsdaZone(city, state);
  }, [city, state]);

  const fertilizerRecommendation = useMemo(() => {
    if (!zoneInfo) return null;
    return getZoneFertilizerRecommendation(zoneInfo, season, lastAppDate, lawnSizeSqFt);
  }, [zoneInfo, season, lastAppDate, lawnSizeSqFt]);

  return { zoneInfo, season, fertilizerRecommendation };
}
