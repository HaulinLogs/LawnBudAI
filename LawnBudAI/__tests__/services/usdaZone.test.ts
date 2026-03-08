/**
 * Tests for the USDA Zone lookup service
 */

import {
  getUsdaZone,
  getZoneNpkSchedule,
  getZoneFertilizerRecommendation,
} from '@/services/usdaZone';

// ---------------------------------------------------------------------------
// getUsdaZone
// ---------------------------------------------------------------------------

describe('getUsdaZone', () => {
  describe('state-level lookups', () => {
    it('returns Zone 5a for Madison, WI', () => {
      const result = getUsdaZone('Madison', 'WI');
      expect(result).not.toBeNull();
      expect(result!.zone).toBe(5);
      expect(result!.subzone).toBe('a');
      expect(result!.label).toBe('Zone 5a');
    });

    it('returns Zone 8a for an unlisted TX city, falling back to state default', () => {
      const result = getUsdaZone('Waco', 'TX');
      expect(result).not.toBeNull();
      expect(result!.zone).toBe(8);
      expect(result!.subzone).toBe('a');
    });

    it('returns cool_season recommendedGrassType for Zone 5', () => {
      const result = getUsdaZone('Madison', 'WI');
      expect(result!.recommendedGrassType).toBe('cool_season');
    });

    it('returns warm_season recommendedGrassType for Zone 9 (FL)', () => {
      const result = getUsdaZone('Tallahassee', 'FL');
      expect(result!.recommendedGrassType).toBe('warm_season');
    });

    it('returns mixed recommendedGrassType for Zone 7 (NC)', () => {
      const result = getUsdaZone('Raleigh', 'NC');
      expect(result).not.toBeNull();
      // NC city override sets Raleigh to 7b → transition zone → mixed
      expect(result!.recommendedGrassType).toBe('mixed');
    });

    it('returns null for an unknown state code', () => {
      const result = getUsdaZone('Springfield', 'ZZ');
      expect(result).toBeNull();
    });

    it('is case-insensitive for state codes', () => {
      const lower = getUsdaZone('Madison', 'wi');
      const upper = getUsdaZone('Madison', 'WI');
      expect(lower).toEqual(upper);
    });
  });

  describe('city-level overrides', () => {
    it('returns Zone 10a for Phoenix, AZ (above state average of 9b)', () => {
      const result = getUsdaZone('Phoenix', 'AZ');
      expect(result!.zone).toBe(10);
      expect(result!.subzone).toBe('a');
    });

    it('returns Zone 7b for New York City, NY', () => {
      const result = getUsdaZone('New York', 'NY');
      expect(result!.zone).toBe(7);
      expect(result!.subzone).toBe('b');
    });

    it('returns Zone 11a for Miami, FL', () => {
      const result = getUsdaZone('Miami', 'FL');
      expect(result!.zone).toBe(11);
      expect(result!.subzone).toBe('a');
      expect(result!.climateCategory).toBe('tropical');
    });

    it('is case-insensitive for city name lookups', () => {
      const lower = getUsdaZone('phoenix', 'AZ');
      const mixed = getUsdaZone('PHOENIX', 'AZ');
      expect(lower).toEqual(mixed);
    });

    it('returns Zone 8b for Seattle, WA (overriding state zone)', () => {
      const result = getUsdaZone('Seattle', 'WA');
      expect(result!.zone).toBe(8);
      expect(result!.subzone).toBe('b');
    });
  });

  describe('zone metadata', () => {
    it('includes frost date information', () => {
      const result = getUsdaZone('Chicago', 'IL');
      expect(result!.typicalFirstFrost).toBeTruthy();
      expect(result!.typicalLastFrost).toBeTruthy();
    });

    it('includes minTempRange', () => {
      const result = getUsdaZone('Chicago', 'IL');
      expect(result!.minTempRange).toBeTruthy();
    });

    it('includes a non-empty description', () => {
      const result = getUsdaZone('Denver', 'CO');
      expect(result!.description.length).toBeGreaterThan(10);
    });

    it('assigns cold climateCategory to Zone 4 (MN)', () => {
      const result = getUsdaZone('Minneapolis', 'MN');
      expect(result!.climateCategory).toBe('cold');
    });

    it('assigns cool climateCategory to Zone 5-6 states', () => {
      const wi = getUsdaZone('Madison', 'WI');
      expect(wi!.climateCategory).toBe('cool');
    });

    it('assigns transition climateCategory to Zone 7', () => {
      const tn = getUsdaZone('Nashville', 'TN');
      expect(tn!.climateCategory).toBe('transition');
    });

    it('assigns warm climateCategory to Zone 8', () => {
      const tx = getUsdaZone('Dallas', 'TX');
      expect(tx!.climateCategory).toBe('warm');
    });

    it('assigns tropical climateCategory to Zone 11', () => {
      const hi = getUsdaZone('Honolulu', 'HI');
      expect(hi!.climateCategory).toBe('tropical');
    });
  });
});

// ---------------------------------------------------------------------------
// getZoneNpkSchedule
// ---------------------------------------------------------------------------

describe('getZoneNpkSchedule', () => {
  it('returns a dormant schedule for cool zones in summer', () => {
    const result = getZoneNpkSchedule('cool', 'summer');
    expect(result.minDaysBetween).toBeNull();
    expect(result.npk).toBe('0-0-0');
  });

  it('returns a dormant schedule for warm zones in winter', () => {
    const result = getZoneNpkSchedule('warm', 'winter');
    expect(result.minDaysBetween).toBeNull();
  });

  it('returns 32-0-8 for cool zones in fall', () => {
    const result = getZoneNpkSchedule('cool', 'fall');
    expect(result.npk).toBe('32-0-8');
  });

  it('returns 30-0-10 for warm zones in summer', () => {
    const result = getZoneNpkSchedule('warm', 'summer');
    expect(result.npk).toBe('30-0-10');
  });

  it('returns 5-0-20 for warm zones in fall', () => {
    const result = getZoneNpkSchedule('warm', 'fall');
    expect(result.npk).toBe('5-0-20');
  });

  it('returns a non-zero rate for active seasons', () => {
    const result = getZoneNpkSchedule('cool', 'spring');
    expect(result.ratePerThousandSqFt).toBeGreaterThan(0);
    expect(result.minDaysBetween).toBeGreaterThan(0);
  });

  it('always includes a proTip', () => {
    const climates = ['cold', 'cool', 'transition', 'warm', 'tropical'] as const;
    const seasons = ['spring', 'summer', 'fall', 'winter'] as const;
    for (const climate of climates) {
      for (const season of seasons) {
        const result = getZoneNpkSchedule(climate, season);
        expect(result.proTip.length).toBeGreaterThan(10);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// getZoneFertilizerRecommendation
// ---------------------------------------------------------------------------

describe('getZoneFertilizerRecommendation', () => {
  const madisonZone = getUsdaZone('Madison', 'WI')!; // Zone 5a, cool
  const nashvilleZone = getUsdaZone('Nashville', 'TN')!; // Zone 7a, transition
  const houstonZone = getUsdaZone('Houston', 'TX')!; // Zone 9a, warm

  describe('dormant season', () => {
    it('returns dormant status for cool zone in summer', () => {
      const result = getZoneFertilizerRecommendation(madisonZone, 'summer');
      expect(result.seasonStatus).toBe('dormant');
      expect(result.daysUntilDue).toBeNull();
      expect(result.suggestedTotalLbs).toBeNull();
      expect(result.timingLabel).toBe('Not recommended this season');
    });

    it('returns dormant status for warm zone in winter', () => {
      const result = getZoneFertilizerRecommendation(houstonZone, 'winter');
      expect(result.seasonStatus).toBe('dormant');
    });
  });

  describe('no fertilizer history', () => {
    it('returns first application recommendation when no history exists', () => {
      const result = getZoneFertilizerRecommendation(madisonZone, 'fall');
      expect(result.seasonStatus).toBe('active');
      expect(result.daysUntilDue).toBe(0);
      expect(result.timingLabel).toBe('No history — first application recommended');
    });

    it('includes NPK ratio in recommendation', () => {
      const result = getZoneFertilizerRecommendation(madisonZone, 'fall');
      expect(result.npk).toBe('32-0-8');
    });

    it('calculates suggested total lbs when lawn size is provided', () => {
      const result = getZoneFertilizerRecommendation(madisonZone, 'fall', undefined, 5000);
      // 4.5 lbs/1000 sqft × 5 = 22.5 lbs
      expect(result.suggestedTotalLbs).toBe(22.5);
    });

    it('returns null for suggestedTotalLbs when lawn size is not provided', () => {
      const result = getZoneFertilizerRecommendation(madisonZone, 'fall', undefined, null);
      expect(result.suggestedTotalLbs).toBeNull();
    });
  });

  describe('timing logic', () => {
    it('returns "Due in X days" when application was recent', () => {
      // Applied 10 days ago; cool fall min is 30 days → 20 days remaining
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const dateStr = tenDaysAgo.toISOString().split('T')[0];

      const result = getZoneFertilizerRecommendation(madisonZone, 'fall', dateStr, null);
      expect(result.daysUntilDue).toBe(20);
      expect(result.timingLabel).toContain('Due in 20 days');
    });

    it('returns "Due today" when exactly at the interval', () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

      const result = getZoneFertilizerRecommendation(madisonZone, 'fall', dateStr, null);
      expect(result.daysUntilDue).toBe(0);
      expect(result.timingLabel).toBe('Due today');
    });

    it('returns overdue message when past the window by more than 14 days', () => {
      const fiftyDaysAgo = new Date();
      fiftyDaysAgo.setDate(fiftyDaysAgo.getDate() - 50);
      const dateStr = fiftyDaysAgo.toISOString().split('T')[0];

      const result = getZoneFertilizerRecommendation(madisonZone, 'fall', dateStr, null);
      expect(result.daysUntilDue).toBeLessThan(-14);
      expect(result.timingLabel).toContain('Overdue');
    });

    it('does not include suggestedTotalLbs when not yet due', () => {
      // Applied 5 days ago; not yet due
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const dateStr = fiveDaysAgo.toISOString().split('T')[0];

      const result = getZoneFertilizerRecommendation(madisonZone, 'fall', dateStr, 5000);
      expect(result.suggestedTotalLbs).toBeNull();
    });
  });

  describe('zone-specific NPK values', () => {
    it('uses 32-0-8 for cool zone fall', () => {
      const result = getZoneFertilizerRecommendation(madisonZone, 'fall');
      expect(result.npk).toBe('32-0-8');
    });

    it('uses 16-4-8 for transition zone spring', () => {
      const result = getZoneFertilizerRecommendation(nashvilleZone, 'spring');
      expect(result.npk).toBe('16-4-8');
    });

    it('uses 30-0-10 for warm zone summer', () => {
      const result = getZoneFertilizerRecommendation(houstonZone, 'summer');
      expect(result.npk).toBe('30-0-10');
    });

    it('uses 5-0-20 for warm zone fall', () => {
      const result = getZoneFertilizerRecommendation(houstonZone, 'fall');
      expect(result.npk).toBe('5-0-20');
    });
  });
});
