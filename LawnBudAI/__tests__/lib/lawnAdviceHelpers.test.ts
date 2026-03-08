/**
 * Tests for lawnAdvice helper functions
 *
 * Covers getSeason, getMowingAdvice, getWateringAdvice,
 * getFertilizerAdvice, and getOverseedingReminder.
 */

import {
  getSeason,
  getMowingAdvice,
  getWateringAdvice,
  getFertilizerAdvice,
  getOverseedingReminder,
  type GrassType,
  type Season,
} from '@/lib/lawnAdvice';

// ---------------------------------------------------------------------------
// getSeason
// ---------------------------------------------------------------------------

describe('getSeason', () => {
  it('returns spring for March', () => {
    expect(getSeason(new Date('2024-03-01'))).toBe('spring');
  });

  it('returns spring for May', () => {
    expect(getSeason(new Date('2024-05-31'))).toBe('spring');
  });

  it('returns summer for June', () => {
    expect(getSeason(new Date('2024-06-01'))).toBe('summer');
  });

  it('returns summer for August', () => {
    expect(getSeason(new Date('2024-08-31'))).toBe('summer');
  });

  it('returns fall for September', () => {
    expect(getSeason(new Date('2024-09-01'))).toBe('fall');
  });

  it('returns fall for November', () => {
    expect(getSeason(new Date('2024-11-30'))).toBe('fall');
  });

  it('returns winter for December', () => {
    expect(getSeason(new Date('2024-12-01'))).toBe('winter');
  });

  it('returns winter for January', () => {
    expect(getSeason(new Date('2024-01-15'))).toBe('winter');
  });

  it('returns a season when called without args (uses today)', () => {
    const result = getSeason();
    expect(['spring', 'summer', 'fall', 'winter']).toContain(result);
  });

  it('returns winter for February', () => {
    expect(getSeason(new Date('2024-02-28'))).toBe('winter');
  });
});

// ---------------------------------------------------------------------------
// getMowingAdvice
// ---------------------------------------------------------------------------

describe('getMowingAdvice', () => {
  const grassTypes: GrassType[] = ['cool_season', 'warm_season', 'mixed'];
  const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];

  it.each(grassTypes)('returns advice with name and text for %s in spring', (grassType) => {
    const advice = getMowingAdvice(grassType, 'spring');
    expect(advice.name).toBe('Mowing');
    expect(advice.text.length).toBeGreaterThan(0);
  });

  it.each(seasons)('returns advice for cool_season in %s', (season) => {
    const advice = getMowingAdvice('cool_season', season);
    expect(advice).toBeDefined();
    expect(advice.text).toBeTruthy();
  });

  it.each(seasons)('returns advice for warm_season in %s', (season) => {
    const advice = getMowingAdvice('warm_season', season);
    expect(advice).toBeDefined();
    expect(advice.text).toBeTruthy();
  });

  it.each(seasons)('returns advice for mixed in %s', (season) => {
    const advice = getMowingAdvice('mixed', season);
    expect(advice).toBeDefined();
    expect(advice.text).toBeTruthy();
  });

  it('returns mixed fallback for unknown grass type', () => {
    // @ts-expect-error intentional invalid type
    const advice = getMowingAdvice('unknown_type', 'spring');
    expect(advice).toBeDefined();
    expect(advice.text).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// getWateringAdvice
// ---------------------------------------------------------------------------

describe('getWateringAdvice', () => {
  const grassTypes: GrassType[] = ['cool_season', 'warm_season', 'mixed'];
  const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];

  it.each(grassTypes)('returns watering advice for %s in summer', (grassType) => {
    const advice = getWateringAdvice(grassType, 'summer');
    expect(advice.name).toBe('Watering');
    expect(advice.text.length).toBeGreaterThan(0);
  });

  it.each(seasons)('returns advice for cool_season in %s', (season) => {
    const advice = getWateringAdvice('cool_season', season);
    expect(advice).toBeDefined();
    expect(advice.text).toBeTruthy();
  });

  it.each(seasons)('returns advice for warm_season in %s', (season) => {
    const advice = getWateringAdvice('warm_season', season);
    expect(advice).toBeDefined();
    expect(advice.text).toBeTruthy();
  });

  it.each(seasons)('returns advice for mixed in %s', (season) => {
    const advice = getWateringAdvice('mixed', season);
    expect(advice).toBeDefined();
    expect(advice.text).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// getFertilizerAdvice
// ---------------------------------------------------------------------------

describe('getFertilizerAdvice', () => {
  const grassTypes: GrassType[] = ['cool_season', 'warm_season', 'mixed'];
  const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];

  it.each(grassTypes)('returns fertilizer advice for %s in fall', (grassType) => {
    const advice = getFertilizerAdvice(grassType, 'fall');
    expect(advice.name).toBe('Fertilizing');
    expect(advice.text.length).toBeGreaterThan(0);
  });

  it.each(seasons)('returns advice for cool_season in %s', (season) => {
    const advice = getFertilizerAdvice('cool_season', season);
    expect(advice).toBeDefined();
    expect(advice.text).toBeTruthy();
  });

  it.each(seasons)('returns advice for warm_season in %s', (season) => {
    const advice = getFertilizerAdvice('warm_season', season);
    expect(advice).toBeDefined();
    expect(advice.text).toBeTruthy();
  });

  it.each(seasons)('returns advice for mixed in %s', (season) => {
    const advice = getFertilizerAdvice('mixed', season);
    expect(advice).toBeDefined();
    expect(advice.text).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// getOverseedingReminder
// ---------------------------------------------------------------------------

describe('getOverseedingReminder', () => {
  // cool_season: nowMonths = [8, 9], soonMonths = [7]
  describe('cool_season', () => {
    it('returns "now" urgency in August (month 8)', () => {
      const result = getOverseedingReminder('cool_season', new Date('2024-08-15'));
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('now');
      expect(result!.title).toBe('Overseed Now');
    });

    it('returns "now" urgency in September (month 9)', () => {
      const result = getOverseedingReminder('cool_season', new Date('2024-09-10'));
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('now');
    });

    it('returns "soon" urgency in July (month 7)', () => {
      const result = getOverseedingReminder('cool_season', new Date('2024-07-20'));
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('soon');
      expect(result!.title).toBe('Overseeding Season Approaching');
    });

    it('returns null in winter (month 1)', () => {
      const result = getOverseedingReminder('cool_season', new Date('2024-01-15'));
      expect(result).toBeNull();
    });

    it('returns null in spring (month 5)', () => {
      const result = getOverseedingReminder('cool_season', new Date('2024-05-10'));
      expect(result).toBeNull();
    });
  });

  // warm_season: nowMonths = [10, 11], soonMonths = [9]
  describe('warm_season', () => {
    it('returns "now" urgency in October (month 10)', () => {
      const result = getOverseedingReminder('warm_season', new Date('2024-10-05'));
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('now');
    });

    it('returns "now" urgency in November (month 11)', () => {
      const result = getOverseedingReminder('warm_season', new Date('2024-11-01'));
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('now');
    });

    it('returns "soon" urgency in September (month 9)', () => {
      const result = getOverseedingReminder('warm_season', new Date('2024-09-15'));
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('soon');
    });

    it('returns null in summer (month 7)', () => {
      const result = getOverseedingReminder('warm_season', new Date('2024-07-04'));
      expect(result).toBeNull();
    });
  });

  // mixed: nowMonths = [8, 9, 10], soonMonths = [7]
  describe('mixed', () => {
    it('returns "now" urgency in August', () => {
      const result = getOverseedingReminder('mixed', new Date('2024-08-20'));
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('now');
    });

    it('returns "now" urgency in October', () => {
      const result = getOverseedingReminder('mixed', new Date('2024-10-01'));
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('now');
    });

    it('returns "soon" urgency in July', () => {
      const result = getOverseedingReminder('mixed', new Date('2024-07-15'));
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('soon');
    });

    it('returns null in spring (month 4)', () => {
      const result = getOverseedingReminder('mixed', new Date('2024-04-10'));
      expect(result).toBeNull();
    });
  });

  it('falls back to mixed for unknown grass type', () => {
    // @ts-expect-error intentional
    const result = getOverseedingReminder('unknown', new Date('2024-08-15'));
    // mixed nowMonths includes 8 → should return a result
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('now');
  });

  it('uses today when called without a date argument', () => {
    // Just verify it does not throw and returns null or a valid reminder
    const result = getOverseedingReminder('cool_season');
    expect(result === null || typeof result!.urgency === 'string').toBe(true);
  });
});
