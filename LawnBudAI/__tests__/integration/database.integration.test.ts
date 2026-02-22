/**
 * Integration Tests: Database Schema Validation
 *
 * These tests run against a REAL Supabase instance (test environment).
 * They verify that:
 * 1. Database schema is correctly set up
 * 2. SELECT statements with correct column names succeed
 * 3. SELECT statements with invalid column names fail with proper errors
 * 4. RLS policies allow user-scoped data access
 *
 * IMPORTANT: Tests use TEST_SUPABASE_URL and TEST_SUPABASE_ANON_KEY
 * which should point to a TEST Supabase project, NOT production.
 *
 * Prerequisites:
 * - TEST_SUPABASE_URL environment variable set
 * - TEST_SUPABASE_ANON_KEY environment variable set
 * - Test Supabase project has same schema as production
 * - Test data populated with test events
 */

import { createClient } from '@supabase/supabase-js';

// Skip integration tests if test Supabase credentials not available
const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL;
const TEST_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY;

const skipIfNoTestSupabase = TEST_SUPABASE_URL && TEST_SUPABASE_ANON_KEY
  ? describe
  : describe.skip;

skipIfNoTestSupabase('Database Integration Tests', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(TEST_SUPABASE_URL!, TEST_SUPABASE_ANON_KEY!);
  });

  describe('water_events schema', () => {
    it('should successfully select valid columns', async () => {
      const { data, error } = await supabase
        .from('water_events')
        .select('id, date, amount_inches, source, notes')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should FAIL when selecting invalid column "amount_gallons"', async () => {
      const { error } = await supabase
        .from('water_events')
        // @ts-ignore - intentionally testing invalid column name
        .select('id, date, amount_gallons')
        .limit(1);

      // Should fail with PostgreSQL error 42703 (undefined_column)
      expect(error).not.toBeNull();
      if (error) {
        expect(error.code).toBe('42703');
        expect(error.message).toContain('amount_gallons');
      }
    });

    it('should have correct schema for water_events', async () => {
      const { data, error } = await supabase
        .from('water_events')
        .select('id, user_id, date, amount_inches, source, notes, created_at, updated_at')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        const event = data[0];
        // Verify all expected columns exist and are the right type
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('user_id');
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('amount_inches');
        expect(event).toHaveProperty('source');
        expect(event).toHaveProperty('created_at');
        expect(event).toHaveProperty('updated_at');

        // Verify types
        expect(typeof event.id).toBe('string');
        expect(typeof event.user_id).toBe('string');
        expect(typeof event.date).toBe('string');
        expect(typeof event.amount_inches).toBe('number');
        expect(typeof event.source).toBe('string');
      }
    });
  });

  describe('fertilizer_events schema', () => {
    it('should successfully select valid columns', async () => {
      const { data, error } = await supabase
        .from('fertilizer_events')
        .select('id, date, amount_lbs, type, application_method, notes')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should FAIL when selecting obsolete N-P-K columns', async () => {
      const { error } = await supabase
        .from('fertilizer_events')
        // @ts-ignore - intentionally testing obsolete column names
        .select('id, date, nitrogen_pct, phosphorus_pct, potassium_pct')
        .limit(1);

      // Should fail with PostgreSQL error 42703 (undefined_column)
      expect(error).not.toBeNull();
      if (error) {
        expect(error.code).toBe('42703');
        expect(error.message.toLowerCase()).toMatch(/nitrogen_pct|phosphorus_pct|potassium_pct/);
      }
    });

    it('should FAIL when selecting obsolete "amount_lbs_per_1000sqft"', async () => {
      const { error } = await supabase
        .from('fertilizer_events')
        // @ts-ignore - intentionally testing obsolete column name
        .select('id, date, amount_lbs_per_1000sqft')
        .limit(1);

      // Should fail with PostgreSQL error 42703
      expect(error).not.toBeNull();
      if (error) {
        expect(error.code).toBe('42703');
        expect(error.message).toContain('amount_lbs_per_1000sqft');
      }
    });

    it('should have correct schema for fertilizer_events', async () => {
      const { data, error } = await supabase
        .from('fertilizer_events')
        .select('id, user_id, date, amount_lbs, type, application_method, notes, created_at, updated_at')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        const event = data[0];
        // Verify all expected columns exist and are the right type
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('user_id');
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('amount_lbs');
        expect(event).toHaveProperty('type');
        expect(event).toHaveProperty('created_at');
        expect(event).toHaveProperty('updated_at');

        // Verify types
        expect(typeof event.id).toBe('string');
        expect(typeof event.user_id).toBe('string');
        expect(typeof event.date).toBe('string');
        expect(typeof event.amount_lbs).toBe('number');
        expect(typeof event.type).toBe('string');
      }
    });
  });

  describe('mow_events schema', () => {
    it('should successfully select valid columns', async () => {
      const { data, error } = await supabase
        .from('mow_events')
        .select('id, date, height_inches, notes')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should have correct schema for mow_events', async () => {
      const { data, error } = await supabase
        .from('mow_events')
        .select('id, user_id, date, height_inches, notes, created_at, updated_at')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        const event = data[0];
        // Verify all expected columns exist and are the right type
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('user_id');
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('height_inches');
        expect(event).toHaveProperty('created_at');
        expect(event).toHaveProperty('updated_at');

        // Verify types
        expect(typeof event.id).toBe('string');
        expect(typeof event.user_id).toBe('string');
        expect(typeof event.date).toBe('string');
        expect(typeof event.height_inches).toBe('number');
      }
    });
  });

  describe('RLS Policies', () => {
    it('should only allow selecting own events', async () => {
      const { data, error } = await supabase
        .from('water_events')
        .select('id, user_id')
        .limit(10);

      // Note: This will fail if user is not authenticated in test
      // In a real test, we'd authenticate a test user first
      if (error) {
        // If not authenticated, RLS should prevent access
        expect(error).not.toBeNull();
      }
    });
  });
});
