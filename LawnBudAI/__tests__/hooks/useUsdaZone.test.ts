/**
 * Tests for useUsdaZone hook
 *
 * Verifies zone lookup, season derivation, and fertilizer recommendation
 * derivation based on city/state inputs and fertilizer history.
 */

import { renderHook } from '@testing-library/react-native';
import { useUsdaZone } from '@/hooks/useUsdaZone';

// Fixed date: March 15, 2024 (spring)
const SPRING_DATE = new Date('2024-03-15');
// Fixed date: July 4, 2024 (summer)
const SUMMER_DATE = new Date('2024-07-04');
// Fixed date: January 10, 2024 (winter)
const WINTER_DATE = new Date('2024-01-10');

describe('useUsdaZone', () => {
  describe('when city and state are empty', () => {
    it('returns null zoneInfo', () => {
      const { result } = renderHook(() =>
        useUsdaZone('', '', undefined, null, SPRING_DATE),
      );
      expect(result.current.zoneInfo).toBeNull();
    });

    it('returns null fertilizerRecommendation', () => {
      const { result } = renderHook(() =>
        useUsdaZone('', '', undefined, null, SPRING_DATE),
      );
      expect(result.current.fertilizerRecommendation).toBeNull();
    });

    it('still returns the correct season', () => {
      const { result } = renderHook(() =>
        useUsdaZone('', '', undefined, null, SUMMER_DATE),
      );
      expect(result.current.season).toBe('summer');
    });

    it('returns null zoneInfo when only city is provided (no state)', () => {
      const { result } = renderHook(() =>
        useUsdaZone('Madison', '', undefined, null, SPRING_DATE),
      );
      expect(result.current.zoneInfo).toBeNull();
    });

    it('returns null zoneInfo when only state is provided (no city)', () => {
      const { result } = renderHook(() =>
        useUsdaZone('', 'WI', undefined, null, SPRING_DATE),
      );
      expect(result.current.zoneInfo).toBeNull();
    });
  });

  describe('when a valid city/state is supplied', () => {
    it('returns correct zone info for Madison, WI', () => {
      const { result } = renderHook(() =>
        useUsdaZone('Madison', 'WI', undefined, null, SPRING_DATE),
      );
      expect(result.current.zoneInfo).not.toBeNull();
      expect(result.current.zoneInfo!.zone).toBe(5);
      expect(result.current.zoneInfo!.subzone).toBe('a');
    });

    it('returns a fertilizer recommendation', () => {
      const { result } = renderHook(() =>
        useUsdaZone('Madison', 'WI', undefined, null, SPRING_DATE),
      );
      expect(result.current.fertilizerRecommendation).not.toBeNull();
    });

    it('returns spring season for March date', () => {
      const { result } = renderHook(() =>
        useUsdaZone('Madison', 'WI', undefined, null, SPRING_DATE),
      );
      expect(result.current.season).toBe('spring');
    });

    it('returns winter season for January date', () => {
      const { result } = renderHook(() =>
        useUsdaZone('Madison', 'WI', undefined, null, WINTER_DATE),
      );
      expect(result.current.season).toBe('winter');
    });
  });

  describe('fertilizer recommendation variations', () => {
    it('includes suggestedTotalLbs when lawnSizeSqFt is provided', () => {
      const { result } = renderHook(() =>
        useUsdaZone('Madison', 'WI', undefined, 5000, SPRING_DATE),
      );
      const rec = result.current.fertilizerRecommendation;
      expect(rec).not.toBeNull();
      expect(rec!.suggestedTotalLbs).not.toBeNull();
    });

    it('returns null suggestedTotalLbs when lawnSizeSqFt is null', () => {
      const { result } = renderHook(() =>
        useUsdaZone('Madison', 'WI', undefined, null, SPRING_DATE),
      );
      const rec = result.current.fertilizerRecommendation;
      expect(rec).not.toBeNull();
      expect(rec!.suggestedTotalLbs).toBeNull();
    });

    it('factors in lastAppDate', () => {
      const recentDate = '2024-03-01';
      const { result } = renderHook(() =>
        useUsdaZone('Madison', 'WI', recentDate, null, SPRING_DATE),
      );
      expect(result.current.fertilizerRecommendation).not.toBeNull();
    });
  });

  describe('unknown city falls back to state default', () => {
    it('returns a zone for an unknown TX city via state fallback', () => {
      const { result } = renderHook(() =>
        useUsdaZone('Smalltown', 'TX', undefined, null, SUMMER_DATE),
      );
      expect(result.current.zoneInfo).not.toBeNull();
      expect(result.current.zoneInfo!.zone).toBeGreaterThanOrEqual(7);
    });
  });

  describe('unknown state', () => {
    it('returns null zoneInfo for an unrecognized state code', () => {
      const { result } = renderHook(() =>
        useUsdaZone('Springfield', 'ZZ', undefined, null, SPRING_DATE),
      );
      expect(result.current.zoneInfo).toBeNull();
      expect(result.current.fertilizerRecommendation).toBeNull();
    });
  });
});
