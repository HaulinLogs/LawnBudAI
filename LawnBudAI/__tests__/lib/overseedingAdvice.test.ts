/**
 * Tests for soil-temp-aware overseeding logic added to lawnAdvice.ts
 */

import {
  evaluateSoilTempForOverseeding,
  getSeedingWateringReminder,
  GERMINATION_INFO,
  OVERSEEDING_ADVICE_LINKS,
} from '@/lib/lawnAdvice';

// ---------------------------------------------------------------------------
// evaluateSoilTempForOverseeding
// ---------------------------------------------------------------------------

describe('evaluateSoilTempForOverseeding', () => {
  describe('cool_season grasses (optimal: 50–65°F)', () => {
    it('returns "ideal" when in 50–65°F range', () => {
      const result = evaluateSoilTempForOverseeding(58, 0, 'cool_season');
      expect(result.status).toBe('ideal');
      expect(result.daysUntilOptimal).toBe(0);
    });

    it('returns "ideal" at boundary temps (50°F)', () => {
      expect(evaluateSoilTempForOverseeding(50, 0, 'cool_season').status).toBe('ideal');
    });

    it('returns "ideal" at boundary temps (65°F)', () => {
      expect(evaluateSoilTempForOverseeding(65, 0, 'cool_season').status).toBe('ideal');
    });

    it('returns "too_warm" when above 65°F with no cooling trend', () => {
      const result = evaluateSoilTempForOverseeding(75, 0, 'cool_season');
      expect(result.status).toBe('too_warm');
    });

    it('returns "approaching" when above 65°F with cooling trend within 30 days', () => {
      // 75°F, cooling at 0.5°F/day → 20 days to reach 65°F
      const result = evaluateSoilTempForOverseeding(75, -0.5, 'cool_season');
      expect(result.status).toBe('approaching');
      expect(result.daysUntilOptimal).toBe(20);
    });

    it('returns "too_cold" when below 50°F with no warming trend', () => {
      const result = evaluateSoilTempForOverseeding(42, 0, 'cool_season');
      expect(result.status).toBe('too_cold');
    });

    it('returns "approaching" when below 50°F with warming trend within 30 days', () => {
      // 42°F, warming at 0.5°F/day → 16 days to reach 50°F
      const result = evaluateSoilTempForOverseeding(42, 0.5, 'cool_season');
      expect(result.status).toBe('approaching');
      expect(result.daysUntilOptimal).toBe(16);
    });
  });

  describe('warm_season grasses (optimal: 65–85°F)', () => {
    it('returns "ideal" when in 65–85°F range', () => {
      expect(evaluateSoilTempForOverseeding(72, 0, 'warm_season').status).toBe('ideal');
    });

    it('returns "too_warm" when above 85°F with no cooling trend', () => {
      expect(evaluateSoilTempForOverseeding(90, 0.1, 'warm_season').status).toBe('too_warm');
    });

    it('returns "too_cold" when below 65°F with no warming trend', () => {
      expect(evaluateSoilTempForOverseeding(55, 0, 'warm_season').status).toBe('too_cold');
    });
  });

  describe('mixed grasses', () => {
    it('uses cool_season thresholds (50–65°F)', () => {
      expect(evaluateSoilTempForOverseeding(58, 0, 'mixed').status).toBe('ideal');
      expect(evaluateSoilTempForOverseeding(70, 0, 'mixed').status).toBe('too_warm');
    });
  });
});

// ---------------------------------------------------------------------------
// getSeedingWateringReminder
// ---------------------------------------------------------------------------

describe('getSeedingWateringReminder', () => {
  it('returns high-urgency reminder on day 0 (day of seeding)', () => {
    const result = getSeedingWateringReminder(0, 'perennial_ryegrass');
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('high');
    expect(result!.message).toContain('Day 1');
  });

  it('returns high-urgency during germination window (before minDays)', () => {
    // perennial_ryegrass minDays=5, maxDays=10 → day 3 is pre-germination
    const result = getSeedingWateringReminder(3, 'perennial_ryegrass');
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('high');
  });

  it('returns high-urgency during open germination window (between min and max days)', () => {
    // perennial_ryegrass: minDays=5, maxDays=10 → day 7 is in germination window
    const result = getSeedingWateringReminder(7, 'perennial_ryegrass');
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('high');
    expect(result!.message).toContain('Germination window open');
  });

  it('returns medium-urgency in post-germination establishment phase (day 11–42)', () => {
    // perennial_ryegrass maxDays=10, so day 20 is post-germination
    const result = getSeedingWateringReminder(20, 'perennial_ryegrass');
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('medium');
  });

  it('returns low-urgency in first mow zone (day 43–60)', () => {
    const result = getSeedingWateringReminder(50, 'perennial_ryegrass');
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('low');
  });

  it('returns null after 60 days', () => {
    const result = getSeedingWateringReminder(61, 'perennial_ryegrass');
    expect(result).toBeNull();
  });

  it('returns null for negative daysSinceSeed', () => {
    const result = getSeedingWateringReminder(-1, 'perennial_ryegrass');
    expect(result).toBeNull();
  });

  it('uses "unknown" germination info when seedType is not specified', () => {
    const result = getSeedingWateringReminder(5);
    expect(result).not.toBeNull();
  });

  it('handles kentucky_bluegrass (slow germinator: 14–30 days)', () => {
    // Day 10 is still pre-germination for bluegrass
    const result = getSeedingWateringReminder(10, 'kentucky_bluegrass');
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('high');
    // Day 31 is post-germination
    const late = getSeedingWateringReminder(31, 'kentucky_bluegrass');
    expect(late).not.toBeNull();
    expect(late!.urgency).toBe('medium');
  });
});

// ---------------------------------------------------------------------------
// GERMINATION_INFO
// ---------------------------------------------------------------------------

describe('GERMINATION_INFO', () => {
  it('contains entries for all expected seed types', () => {
    const expectedTypes = [
      'kentucky_bluegrass', 'tall_fescue', 'perennial_ryegrass', 'fine_fescue',
      'bermudagrass', 'zoysiagrass', 'st_augustine', 'centipede',
      'annual_ryegrass', 'mixed', 'unknown',
    ];
    for (const type of expectedTypes) {
      expect(GERMINATION_INFO).toHaveProperty(type);
    }
  });

  it('perennial ryegrass has the fastest germination (5–10 days)', () => {
    expect(GERMINATION_INFO.perennial_ryegrass.minDays).toBe(5);
    expect(GERMINATION_INFO.perennial_ryegrass.maxDays).toBe(10);
  });

  it('kentucky bluegrass is the slowest cool-season germinator', () => {
    expect(GERMINATION_INFO.kentucky_bluegrass.minDays).toBe(14);
    expect(GERMINATION_INFO.kentucky_bluegrass.maxDays).toBe(30);
  });

  it('cool-season grasses have optimal soil temp range of 50–65°F', () => {
    const coolTypes = ['kentucky_bluegrass', 'tall_fescue', 'perennial_ryegrass', 'fine_fescue'] as const;
    for (const t of coolTypes) {
      expect(GERMINATION_INFO[t].optimalSoilTempMin).toBe(50);
      expect(GERMINATION_INFO[t].optimalSoilTempMax).toBe(65);
    }
  });

  it('warm-season grasses have optimal soil temp above 65°F', () => {
    const warmTypes = ['bermudagrass', 'zoysiagrass', 'st_augustine', 'centipede'] as const;
    for (const t of warmTypes) {
      expect(GERMINATION_INFO[t].optimalSoilTempMin).toBeGreaterThanOrEqual(65);
    }
  });

  it('all entries have a referenceUrl', () => {
    for (const [, info] of Object.entries(GERMINATION_INFO)) {
      expect(info.referenceUrl).toMatch(/^https:\/\//);
    }
  });
});

// ---------------------------------------------------------------------------
// OVERSEEDING_ADVICE_LINKS
// ---------------------------------------------------------------------------

describe('OVERSEEDING_ADVICE_LINKS', () => {
  it('has links for all three grass types', () => {
    expect(OVERSEEDING_ADVICE_LINKS).toHaveProperty('cool_season');
    expect(OVERSEEDING_ADVICE_LINKS).toHaveProperty('warm_season');
    expect(OVERSEEDING_ADVICE_LINKS).toHaveProperty('mixed');
  });

  it('each grass type has at least 2 links', () => {
    for (const [, links] of Object.entries(OVERSEEDING_ADVICE_LINKS)) {
      expect(links.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('all links have label and valid URL', () => {
    for (const [, links] of Object.entries(OVERSEEDING_ADVICE_LINKS)) {
      for (const link of links) {
        expect(link.label).toBeTruthy();
        expect(link.url).toMatch(/^https:\/\//);
      }
    }
  });
});
