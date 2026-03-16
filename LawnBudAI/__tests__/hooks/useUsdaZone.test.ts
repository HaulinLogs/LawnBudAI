/**
 * Tests for the useUsdaZone hook
 */

import { renderHook } from '@testing-library/react-native';
import { useUsdaZone } from '@/hooks/useUsdaZone';

describe('useUsdaZone', () => {
  it('returns zoneInfo for a known city and state', () => {
    const { result } = renderHook(() =>
      useUsdaZone('Madison', 'WI', undefined, null),
    );

    expect(result.current.zoneInfo).not.toBeNull();
    expect(result.current.zoneInfo!.zone).toBe(5);
    expect(result.current.zoneInfo!.label).toBe('Zone 5a');
  });

  it('returns null zoneInfo when city and state are empty', () => {
    const { result } = renderHook(() => useUsdaZone('', '', undefined, null));

    expect(result.current.zoneInfo).toBeNull();
    expect(result.current.fertilizerRecommendation).toBeNull();
  });

  it('returns a fertilizer recommendation when zone is known', () => {
    const { result } = renderHook(() =>
      useUsdaZone('Madison', 'WI', undefined, null),
    );

    expect(result.current.fertilizerRecommendation).not.toBeNull();
    expect(result.current.fertilizerRecommendation!.npk).toBeTruthy();
  });

  it('includes lawn size in the fertilizer recommendation', () => {
    const { result } = renderHook(() =>
      useUsdaZone('Madison', 'WI', undefined, 5000),
    );

    expect(result.current.fertilizerRecommendation).not.toBeNull();
    // With known lawn size, suggestedTotalLbs should be calculated
    expect(result.current.fertilizerRecommendation!.suggestedTotalLbs).not.toBeNull();
  });

  it('returns a season', () => {
    const { result } = renderHook(() =>
      useUsdaZone('Madison', 'WI', undefined, null),
    );

    expect(['spring', 'summer', 'fall', 'winter']).toContain(result.current.season);
  });

  it('returns warm_season zone for Phoenix, AZ', () => {
    const { result } = renderHook(() =>
      useUsdaZone('Phoenix', 'AZ', undefined, null),
    );

    expect(result.current.zoneInfo).not.toBeNull();
    expect(result.current.zoneInfo!.zone).toBe(10);
    expect(result.current.zoneInfo!.recommendedGrassType).toBe('warm_season');
  });
});
