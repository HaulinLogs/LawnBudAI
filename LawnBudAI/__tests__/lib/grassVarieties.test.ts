/**
 * Tests for lib/grassVarieties.ts
 *
 * Covers the variety catalog and all three helper functions.
 * Written before implementation (TDD).
 */

import {
  GRASS_VARIETIES,
  getVarietiesForZone,
  getGrassTypeForVariety,
  getMowHeightForVariety,
  type GrassVariety,
  type GrassVarietyId,
  type SunExposure,
  type SoilType,
} from '@/lib/grassVarieties';

// ---------------------------------------------------------------------------
// Catalog completeness
// ---------------------------------------------------------------------------

describe('GRASS_VARIETIES catalog', () => {
  it('contains all 10 expected varieties', () => {
    const expected: GrassVarietyId[] = [
      'kentucky_bluegrass',
      'tall_fescue',
      'perennial_ryegrass',
      'fine_fescue',
      'creeping_red_fescue',
      'bermudagrass',
      'zoysiagrass',
      'st_augustine',
      'centipede',
      'buffalo_grass',
    ];
    for (const id of expected) {
      expect(GRASS_VARIETIES.find((v) => v.id === id)).toBeDefined();
    }
  });

  it('every variety has all required fields', () => {
    for (const v of GRASS_VARIETIES) {
      expect(v.id).toBeTruthy();
      expect(v.displayName).toBeTruthy();
      expect(['cool_season', 'warm_season', 'mixed']).toContain(v.grassType);
      expect(v.sunExposure.length).toBeGreaterThan(0);
      expect(v.soilPreference.length).toBeGreaterThan(0);
      expect(v.regions.length).toBeGreaterThan(0);
      expect(v.mowHeightRange).toHaveLength(2);
      expect(v.mowHeightRange[0]).toBeLessThan(v.mowHeightRange[1]);
      expect(v.description).toBeTruthy();
      expect(v.storeTip).toBeTruthy();
      expect(v.exampleProducts.length).toBeGreaterThan(0);
    }
  });

  it('cool-season varieties map to cool_season grassType', () => {
    const coolIds: GrassVarietyId[] = [
      'kentucky_bluegrass',
      'tall_fescue',
      'perennial_ryegrass',
      'fine_fescue',
      'creeping_red_fescue',
    ];
    for (const id of coolIds) {
      const v = GRASS_VARIETIES.find((x) => x.id === id)!;
      expect(v.grassType).toBe('cool_season');
    }
  });

  it('warm-season varieties map to warm_season grassType', () => {
    const warmIds: GrassVarietyId[] = [
      'bermudagrass',
      'zoysiagrass',
      'st_augustine',
      'centipede',
      'buffalo_grass',
    ];
    for (const id of warmIds) {
      const v = GRASS_VARIETIES.find((x) => x.id === id)!;
      expect(v.grassType).toBe('warm_season');
    }
  });
});

// ---------------------------------------------------------------------------
// Mow height spot checks
// ---------------------------------------------------------------------------

describe('mow height ranges', () => {
  it('bermudagrass has [0.5, 1.5]', () => {
    const v = GRASS_VARIETIES.find((x) => x.id === 'bermudagrass')!;
    expect(v.mowHeightRange).toEqual([0.5, 1.5]);
  });

  it('tall_fescue has [3, 4]', () => {
    const v = GRASS_VARIETIES.find((x) => x.id === 'tall_fescue')!;
    expect(v.mowHeightRange).toEqual([3, 4]);
  });

  it('st_augustine has [3.5, 4]', () => {
    const v = GRASS_VARIETIES.find((x) => x.id === 'st_augustine')!;
    expect(v.mowHeightRange).toEqual([3.5, 4]);
  });
});

// ---------------------------------------------------------------------------
// getVarietiesForZone
// ---------------------------------------------------------------------------

describe('getVarietiesForZone', () => {
  it('returns only cool-season varieties for cold climate', () => {
    const results = getVarietiesForZone('cold');
    for (const v of results) {
      expect(v.regions).toContain('cold');
    }
    expect(results.some((v) => v.id === 'bermudagrass')).toBe(false);
  });

  it('returns only warm-season varieties for tropical climate', () => {
    const results = getVarietiesForZone('tropical');
    for (const v of results) {
      expect(v.regions).toContain('tropical');
    }
    expect(results.some((v) => v.id === 'kentucky_bluegrass')).toBe(false);
  });

  it('filters by full_sun when sunExposure provided for cool zone', () => {
    const results = getVarietiesForZone('cool', 'full_sun');
    for (const v of results) {
      expect(v.sunExposure).toContain('full_sun');
    }
    // fine_fescue (dense_shade only) should not appear
    expect(results.some((v) => v.id === 'creeping_red_fescue')).toBe(false);
  });

  it('returns St. Augustine for warm zone with dense_shade', () => {
    const results = getVarietiesForZone('warm', 'dense_shade');
    expect(results.some((v) => v.id === 'st_augustine')).toBe(true);
  });

  it('returns bermudagrass for warm zone with full_sun', () => {
    const results = getVarietiesForZone('warm', 'full_sun');
    expect(results.some((v) => v.id === 'bermudagrass')).toBe(true);
  });

  it('transition zone returns both cool and warm season options', () => {
    const results = getVarietiesForZone('transition');
    const hasCool = results.some((v) => v.grassType === 'cool_season');
    const hasWarm = results.some((v) => v.grassType === 'warm_season');
    expect(hasCool).toBe(true);
    expect(hasWarm).toBe(true);
  });

  it('returns empty array for unknown zone', () => {
    const results = getVarietiesForZone('arctic' as string);
    expect(results).toEqual([]);
  });

  it('returns all zone varieties when sunExposure is undefined', () => {
    const withFilter = getVarietiesForZone('cool', 'full_sun');
    const withoutFilter = getVarietiesForZone('cool');
    expect(withoutFilter.length).toBeGreaterThanOrEqual(withFilter.length);
  });
});

// ---------------------------------------------------------------------------
// getGrassTypeForVariety
// ---------------------------------------------------------------------------

describe('getGrassTypeForVariety', () => {
  it('returns warm_season for bermudagrass', () => {
    expect(getGrassTypeForVariety('bermudagrass')).toBe('warm_season');
  });

  it('returns cool_season for kentucky_bluegrass', () => {
    expect(getGrassTypeForVariety('kentucky_bluegrass')).toBe('cool_season');
  });

  it('returns cool_season for tall_fescue', () => {
    expect(getGrassTypeForVariety('tall_fescue')).toBe('cool_season');
  });

  it('returns warm_season for zoysiagrass', () => {
    expect(getGrassTypeForVariety('zoysiagrass')).toBe('warm_season');
  });

  it('returns mixed as fallback for unknown variety id', () => {
    expect(getGrassTypeForVariety('unknown_grass')).toBe('mixed');
  });
});

// ---------------------------------------------------------------------------
// getMowHeightForVariety
// ---------------------------------------------------------------------------

describe('getMowHeightForVariety', () => {
  it('returns [0.5, 1.5] for bermudagrass', () => {
    expect(getMowHeightForVariety('bermudagrass')).toEqual([0.5, 1.5]);
  });

  it('returns [1, 2] for zoysiagrass', () => {
    expect(getMowHeightForVariety('zoysiagrass')).toEqual([1, 2]);
  });

  it('returns [1.5, 2] for centipede', () => {
    expect(getMowHeightForVariety('centipede')).toEqual([1.5, 2]);
  });

  it('returns [2.5, 3.5] for kentucky_bluegrass', () => {
    expect(getMowHeightForVariety('kentucky_bluegrass')).toEqual([2.5, 3.5]);
  });

  it('returns null for unknown variety id', () => {
    expect(getMowHeightForVariety('unknown_grass')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

describe('type definitions', () => {
  it('SunExposure values are correct strings', () => {
    const values: SunExposure[] = ['full_sun', 'sun_and_shade', 'dense_shade'];
    expect(values).toHaveLength(3);
  });

  it('SoilType values are correct strings', () => {
    const values: SoilType[] = ['sandy', 'loamy', 'clay'];
    expect(values).toHaveLength(3);
  });

  it('GrassVariety interface shape is correct', () => {
    const variety: GrassVariety = GRASS_VARIETIES[0];
    expect(typeof variety.id).toBe('string');
    expect(typeof variety.displayName).toBe('string');
    expect(typeof variety.description).toBe('string');
    expect(typeof variety.storeTip).toBe('string');
    expect(Array.isArray(variety.exampleProducts)).toBe(true);
  });
});
