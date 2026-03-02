import { getFertilizerAdvisory } from '@/lib/lawnAdvice';

/**
 * Tests for getFertilizerAdvisory().
 *
 * Date arithmetic is verified by pinning `new Date()` via jest.useFakeTimers.
 * All tests use a fixed "today" so results are deterministic regardless of
 * when the suite runs.
 *
 * Season reference:
 *   Spring  Mar–May   (month 3–5)
 *   Summer  Jun–Aug   (month 6–8)
 *   Fall    Sep–Nov   (month 9–11)
 *   Winter  Dec–Feb   (month 12–2)
 */

describe('getFertilizerAdvisory', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ---------------------------------------------------------------------------
  // Dormant season — no application recommended
  // ---------------------------------------------------------------------------

  describe('dormant season', () => {
    it('returns dormant for cool_season + summer', () => {
      jest.setSystemTime(new Date('2026-07-15'));
      const advisory = getFertilizerAdvisory('cool_season', 'summer');
      expect(advisory.status).toBe('dormant');
      expect(advisory.heading).toBe('No Fertilizer Needed');
      expect(advisory.suggestedAmountLbs).toBeNull();
      expect(advisory.daysUntilDue).toBeNull();
    });

    it('returns dormant for cool_season + winter', () => {
      jest.setSystemTime(new Date('2026-01-10'));
      const advisory = getFertilizerAdvisory('cool_season', 'winter');
      expect(advisory.status).toBe('dormant');
      expect(advisory.suggestedAmountLbs).toBeNull();
      expect(advisory.daysUntilDue).toBeNull();
    });

    it('returns dormant for warm_season + winter', () => {
      jest.setSystemTime(new Date('2026-12-20'));
      const advisory = getFertilizerAdvisory('warm_season', 'winter');
      expect(advisory.status).toBe('dormant');
    });

    it('returns dormant for mixed + summer', () => {
      jest.setSystemTime(new Date('2026-08-01'));
      const advisory = getFertilizerAdvisory('mixed', 'summer');
      expect(advisory.status).toBe('dormant');
    });

    it('ignores lastAppDate and lawnSize when dormant', () => {
      jest.setSystemTime(new Date('2026-07-01'));
      const advisory = getFertilizerAdvisory('cool_season', 'summer', '2026-06-01', 5000);
      expect(advisory.status).toBe('dormant');
      expect(advisory.suggestedAmountLbs).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // First application — active season, no history
  // ---------------------------------------------------------------------------

  describe('first_application', () => {
    it('returns first_application when no lastAppDate in active season', () => {
      jest.setSystemTime(new Date('2026-04-01'));
      const advisory = getFertilizerAdvisory('cool_season', 'spring');
      expect(advisory.status).toBe('first_application');
      expect(advisory.heading).toBe('Schedule Your First Application');
      expect(advisory.daysUntilDue).toBe(0);
    });

    it('includes suggestedAmountLbs when lawnSizeSqFt is set', () => {
      jest.setSystemTime(new Date('2026-10-01'));
      // cool_season fall: ratePerThousandSqFt = 4.5; 5000 sqft → 22.5 lbs
      const advisory = getFertilizerAdvisory('cool_season', 'fall', undefined, 5000);
      expect(advisory.status).toBe('first_application');
      expect(advisory.suggestedAmountLbs).toBe(22.5);
      expect(advisory.detail).toContain('5,000 sq ft');
      expect(advisory.detail).toContain('22.5 lbs');
    });

    it('sets suggestedAmountLbs to null when lawnSizeSqFt is not set', () => {
      jest.setSystemTime(new Date('2026-10-01'));
      const advisory = getFertilizerAdvisory('cool_season', 'fall', undefined, undefined);
      expect(advisory.status).toBe('first_application');
      expect(advisory.suggestedAmountLbs).toBeNull();
      expect(advisory.detail).toContain('Set your lawn size in Settings');
    });

    it('sets suggestedAmountLbs to null when lawnSizeSqFt is null', () => {
      jest.setSystemTime(new Date('2026-10-01'));
      const advisory = getFertilizerAdvisory('cool_season', 'fall', undefined, null);
      expect(advisory.suggestedAmountLbs).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // too_soon — last application within the minimum interval
  // ---------------------------------------------------------------------------

  describe('too_soon', () => {
    it('returns too_soon when last app was 10 days ago (cool_season fall, min=30)', () => {
      jest.setSystemTime(new Date('2026-10-15'));
      const advisory = getFertilizerAdvisory('cool_season', 'fall', '2026-10-05');
      expect(advisory.status).toBe('too_soon');
      expect(advisory.heading).toBe('Too Soon to Fertilize');
      expect(advisory.daysUntilDue).toBe(20);
      expect(advisory.detail).toContain('10 days ago');
      expect(advisory.detail).toContain('Wait 20 more days');
    });

    it('returns too_soon when last app was 1 day ago', () => {
      jest.setSystemTime(new Date('2026-04-10'));
      const advisory = getFertilizerAdvisory('cool_season', 'spring', '2026-04-09');
      expect(advisory.status).toBe('too_soon');
      expect(advisory.daysUntilDue).toBe(44);
      expect(advisory.detail).toContain('1 day ago');   // singular
      expect(advisory.detail).toContain('44 more days');
    });

    it('uses singular "day" when exactly 1 day remains', () => {
      jest.setSystemTime(new Date('2026-10-15'));
      // fall cool_season min=30; last app was 29 days ago → 1 day remaining
      const advisory = getFertilizerAdvisory('cool_season', 'fall', '2026-09-16');
      expect(advisory.status).toBe('too_soon');
      expect(advisory.daysUntilDue).toBe(1);
      expect(advisory.detail).toContain('1 more day');
    });

    it('sets suggestedAmountLbs to null when too_soon', () => {
      jest.setSystemTime(new Date('2026-10-15'));
      const advisory = getFertilizerAdvisory('cool_season', 'fall', '2026-10-05', 5000);
      expect(advisory.suggestedAmountLbs).toBeNull();
    });

    it('returns too_soon for warm_season summer (min=42)', () => {
      jest.setSystemTime(new Date('2026-07-15'));
      const advisory = getFertilizerAdvisory('warm_season', 'summer', '2026-07-01');
      expect(advisory.status).toBe('too_soon');
      expect(advisory.daysUntilDue).toBe(28); // 42 - 14
    });
  });

  // ---------------------------------------------------------------------------
  // due — last application at or just past the minimum interval (within 14d)
  // ---------------------------------------------------------------------------

  describe('due', () => {
    it('returns due when last app was exactly minDaysBetween days ago', () => {
      jest.setSystemTime(new Date('2026-10-15'));
      // cool_season fall min=30; last app 30 days ago
      const advisory = getFertilizerAdvisory('cool_season', 'fall', '2026-09-15');
      expect(advisory.status).toBe('due');
      expect(advisory.heading).toBe('Time to Fertilize');
      expect(advisory.daysUntilDue).toBe(0);
    });

    it('returns due when last app is 14 days past the window (boundary)', () => {
      jest.setSystemTime(new Date('2026-10-15'));
      // last app = 44 days ago, min=30, daysUntilDue = -14 → NOT overdue (boundary)
      const advisory = getFertilizerAdvisory('cool_season', 'fall', '2026-09-01');
      expect(advisory.status).toBe('due');
      expect(advisory.daysUntilDue).toBe(0);
    });

    it('includes suggestedAmountLbs with lawn size', () => {
      jest.setSystemTime(new Date('2026-10-15'));
      // cool_season fall, 5000 sqft → 22.5 lbs
      const advisory = getFertilizerAdvisory('cool_season', 'fall', '2026-09-15', 5000);
      expect(advisory.status).toBe('due');
      expect(advisory.suggestedAmountLbs).toBe(22.5);
      expect(advisory.detail).toContain('22.5 lbs');
    });

    it('returns due for warm_season spring when interval is met', () => {
      jest.setSystemTime(new Date('2026-05-20'));
      // warm_season spring min=45; last app 45 days ago
      const advisory = getFertilizerAdvisory('warm_season', 'spring', '2026-04-05');
      expect(advisory.status).toBe('due');
    });
  });

  // ---------------------------------------------------------------------------
  // overdue — past the window by more than 14 days
  // ---------------------------------------------------------------------------

  describe('overdue', () => {
    it('returns overdue when last app was 46 days ago (cool_season fall, min=30)', () => {
      jest.setSystemTime(new Date('2026-10-15'));
      // 46 days ago → daysUntilDue = 30-46 = -16 < -14 → overdue
      const advisory = getFertilizerAdvisory('cool_season', 'fall', '2026-08-30');
      expect(advisory.status).toBe('overdue');
      expect(advisory.heading).toBe('Fertilization Overdue');
      expect(advisory.daysUntilDue).toBe(-16);
      expect(advisory.detail).toContain('46 days since');
      expect(advisory.detail).toContain('16 days past');
    });

    it('includes suggestedAmountLbs with lawn size when overdue', () => {
      jest.setSystemTime(new Date('2026-10-15'));
      const advisory = getFertilizerAdvisory('cool_season', 'fall', '2026-08-30', 5000);
      expect(advisory.status).toBe('overdue');
      expect(advisory.suggestedAmountLbs).toBe(22.5);
      expect(advisory.detail).toContain('22.5 lbs');
    });

    it('does not trigger overdue at exactly 15 days past window', () => {
      jest.setSystemTime(new Date('2026-10-15'));
      // 45 days ago → daysUntilDue = 30-45 = -15 < -14 → overdue
      const advisory = getFertilizerAdvisory('cool_season', 'fall', '2026-08-31');
      expect(advisory.status).toBe('overdue');
      expect(advisory.daysUntilDue).toBe(-15);
    });
  });

  // ---------------------------------------------------------------------------
  // Dose calculation
  // ---------------------------------------------------------------------------

  describe('dose calculation', () => {
    it('computes cool_season fall dose: (5000/1000)*4.5 = 22.5 lbs', () => {
      jest.setSystemTime(new Date('2026-10-01'));
      const advisory = getFertilizerAdvisory('cool_season', 'fall', undefined, 5000);
      expect(advisory.suggestedAmountLbs).toBe(22.5);
    });

    it('computes cool_season spring dose: (3000/1000)*3.5 = 10.5 lbs', () => {
      jest.setSystemTime(new Date('2026-04-01'));
      const advisory = getFertilizerAdvisory('cool_season', 'spring', undefined, 3000);
      expect(advisory.suggestedAmountLbs).toBe(10.5);
    });

    it('computes warm_season summer dose: (8000/1000)*4.0 = 32.0 lbs', () => {
      jest.setSystemTime(new Date('2026-07-01'));
      const advisory = getFertilizerAdvisory('warm_season', 'summer', undefined, 8000);
      expect(advisory.suggestedAmountLbs).toBe(32);
    });

    it('rounds dose to one decimal place', () => {
      jest.setSystemTime(new Date('2026-10-01'));
      // (3333/1000)*4.5 = 14.9985 → rounds to 15.0
      const advisory = getFertilizerAdvisory('cool_season', 'fall', undefined, 3333);
      expect(advisory.suggestedAmountLbs).toBe(15);
    });

    it('returns null suggestedAmountLbs when lawnSizeSqFt is 0', () => {
      jest.setSystemTime(new Date('2026-10-01'));
      const advisory = getFertilizerAdvisory('cool_season', 'fall', undefined, 0);
      expect(advisory.suggestedAmountLbs).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // typeRecommendation
  // ---------------------------------------------------------------------------

  describe('typeRecommendation', () => {
    it('recommends high-nitrogen blend for cool_season fall', () => {
      jest.setSystemTime(new Date('2026-10-01'));
      const advisory = getFertilizerAdvisory('cool_season', 'fall');
      expect(advisory.typeRecommendation).toContain('32-0-8');
    });

    it('recommends balanced blend for cool_season spring', () => {
      jest.setSystemTime(new Date('2026-04-01'));
      const advisory = getFertilizerAdvisory('cool_season', 'spring');
      expect(advisory.typeRecommendation).toContain('10-10-10');
    });

    it('recommends winterizer for warm_season fall', () => {
      jest.setSystemTime(new Date('2026-09-15'));
      const advisory = getFertilizerAdvisory('warm_season', 'fall');
      expect(advisory.typeRecommendation).toContain('5-0-20');
    });
  });
});
