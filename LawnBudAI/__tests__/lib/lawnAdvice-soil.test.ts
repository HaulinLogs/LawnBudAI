/**
 * Tests for soil-type-aware watering advice added to lawnAdvice.ts (Phase 4).
 *
 * getWateringAdviceWithSoil() wraps the existing getWateringAdvice() and
 * appends a soil-specific modifier note. Existing callers are unaffected.
 */

import { getWateringAdviceWithSoil } from '@/lib/lawnAdvice';

describe('getWateringAdviceWithSoil', () => {
  describe('loamy soil — baseline (no modifier)', () => {
    it('returns the same text as the base advice for cool_season summer', () => {
      const result = getWateringAdviceWithSoil('cool_season', 'summer', 'loamy');
      expect(result.text).not.toContain('Sandy soil');
      expect(result.text).not.toContain('Clay soil');
      // Loamy = standard — no soil note added
      expect(result.text).toContain('1–1.5"');
    });

    it('returns standard text for warm_season spring', () => {
      const result = getWateringAdviceWithSoil('warm_season', 'spring', 'loamy');
      expect(result.text).not.toContain('Sandy soil');
      expect(result.text).not.toContain('Clay soil');
    });
  });

  describe('sandy soil — extra watering session', () => {
    it('appends sandy-soil note for cool_season summer', () => {
      const result = getWateringAdviceWithSoil('cool_season', 'summer', 'sandy');
      expect(result.text).toContain('Sandy soil');
    });

    it('appends sandy-soil note for warm_season summer', () => {
      const result = getWateringAdviceWithSoil('warm_season', 'summer', 'sandy');
      expect(result.text).toContain('Sandy soil');
    });

    it('appends sandy-soil note for mixed fall', () => {
      const result = getWateringAdviceWithSoil('mixed', 'fall', 'sandy');
      expect(result.text).toContain('Sandy soil');
    });
  });

  describe('clay soil — fewer sessions, aerate note', () => {
    it('appends clay-soil note for cool_season summer', () => {
      const result = getWateringAdviceWithSoil('cool_season', 'summer', 'clay');
      expect(result.text).toContain('Clay soil');
    });

    it('appends clay-soil note for warm_season summer', () => {
      const result = getWateringAdviceWithSoil('warm_season', 'summer', 'clay');
      expect(result.text).toContain('Clay soil');
    });

    it('includes aeration tip for fall cool_season on clay', () => {
      const result = getWateringAdviceWithSoil('cool_season', 'fall', 'clay');
      expect(result.text).toContain('aerat');
    });
  });

  describe('undefined soilType — falls back to baseline', () => {
    it('returns standard advice when soilType is undefined', () => {
      const result = getWateringAdviceWithSoil('cool_season', 'summer', undefined);
      expect(result.text).not.toContain('Sandy soil');
      expect(result.text).not.toContain('Clay soil');
    });
  });

  describe('name field is preserved', () => {
    it('returns name "Watering" regardless of soil type', () => {
      expect(getWateringAdviceWithSoil('cool_season', 'summer', 'sandy').name).toBe('Watering');
      expect(getWateringAdviceWithSoil('cool_season', 'summer', 'clay').name).toBe('Watering');
      expect(getWateringAdviceWithSoil('cool_season', 'summer', 'loamy').name).toBe('Watering');
    });
  });

  describe('sandy soil advice differs from clay soil advice', () => {
    it('sandy and clay produce different watering text', () => {
      const sandy = getWateringAdviceWithSoil('cool_season', 'summer', 'sandy');
      const clay = getWateringAdviceWithSoil('cool_season', 'summer', 'clay');
      expect(sandy.text).not.toBe(clay.text);
    });
  });
});
