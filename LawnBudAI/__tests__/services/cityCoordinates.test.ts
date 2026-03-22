/**
 * Tests for the city coordinates lookup service
 */

import { getCityCoordinates } from '@/services/cityCoordinates';

describe('getCityCoordinates', () => {
  describe('city-level lookups', () => {
    it('returns coordinates for Madison, WI', () => {
      const result = getCityCoordinates('Madison', 'WI');
      expect(result).not.toBeNull();
      expect(result!.lat).toBeCloseTo(43.07, 1);
      expect(result!.lon).toBeCloseTo(-89.4, 1);
    });

    it('is case-insensitive for city names', () => {
      const lower = getCityCoordinates('madison', 'WI');
      const upper = getCityCoordinates('MADISON', 'WI');
      const mixed = getCityCoordinates('Madison', 'WI');
      expect(lower).toEqual(mixed);
      expect(upper).toEqual(mixed);
    });

    it('returns coordinates for Phoenix, AZ (warm-season city)', () => {
      const result = getCityCoordinates('Phoenix', 'AZ');
      expect(result).not.toBeNull();
      expect(result!.lat).toBeCloseTo(33.45, 1);
      expect(result!.lon).toBeCloseTo(-112.07, 1);
    });

    it('handles multi-word city names', () => {
      const result = getCityCoordinates('New York', 'NY');
      expect(result).not.toBeNull();
      expect(result!.lat).toBeCloseTo(40.71, 1);
    });
  });

  describe('state-level fallbacks', () => {
    it('returns state center for an unlisted city in WI', () => {
      const result = getCityCoordinates('Wausau', 'WI');
      expect(result).not.toBeNull();
      // Falls back to WI state center
      expect(result!.lat).toBeCloseTo(44.27, 1);
    });

    it('returns state center for Texas when city is not in override list', () => {
      const result = getCityCoordinates('Waco', 'TX');
      expect(result).not.toBeNull();
      expect(result!.lat).toBeCloseTo(31.47, 1);
    });

    it('covers all 50 states plus DC', () => {
      const states = [
        'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL',
        'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA',
        'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE',
        'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI',
        'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY',
      ];
      for (const state of states) {
        const result = getCityCoordinates('Unknown City', state);
        expect(result).not.toBeNull();
      }
    });
  });

  describe('unknown locations', () => {
    it('returns null for an unknown state code', () => {
      const result = getCityCoordinates('Springfield', 'ZZ');
      expect(result).toBeNull();
    });
  });
});
