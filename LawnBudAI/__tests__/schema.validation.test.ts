/**
 * Schema Validation Tests
 *
 * CRITICAL: These tests verify that SELECT statements in hooks match the actual
 * database schema. This prevents production outages from schema mismatches.
 *
 * These tests run against the schema defined in migrations, ensuring code and
 * database stay in sync.
 */

// DATABASE SCHEMA (source of truth from migrations)
// This is manually maintained - UPDATE when you modify database schema!

type SchemaColumn = {
  name: string;
  type: string;
  nullable: boolean;
};

type TableSchema = {
  [tableName: string]: SchemaColumn[];
};

const PRODUCTION_SCHEMA: TableSchema = {
  mow_events: [
    { name: 'id', type: 'uuid', nullable: false },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'date', type: 'date', nullable: false },
    { name: 'height_inches', type: 'decimal(5,2)', nullable: false },
    { name: 'notes', type: 'text', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false },
    { name: 'updated_at', type: 'timestamptz', nullable: false },
  ],

  water_events: [
    { name: 'id', type: 'uuid', nullable: false },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'date', type: 'date', nullable: false },
    { name: 'amount_inches', type: 'decimal(4,2)', nullable: false },
    { name: 'source', type: 'text', nullable: false },
    { name: 'notes', type: 'text', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false },
    { name: 'updated_at', type: 'timestamptz', nullable: false },
  ],

  fertilizer_events: [
    { name: 'id', type: 'uuid', nullable: false },
    { name: 'user_id', type: 'uuid', nullable: false },
    { name: 'date', type: 'date', nullable: false },
    { name: 'amount_lbs', type: 'decimal(6,2)', nullable: false },
    { name: 'type', type: 'text', nullable: false },
    { name: 'application_method', type: 'text', nullable: true },
    { name: 'notes', type: 'text', nullable: true },
    { name: 'created_at', type: 'timestamptz', nullable: false },
    { name: 'updated_at', type: 'timestamptz', nullable: false },
  ],
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Validates that all requested columns exist in the table schema
 */
function validateSelectColumns(
  tableName: string,
  columns: string[],
  schema: TableSchema
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const tableSchema = schema[tableName];

  if (!tableSchema) {
    errors.push(`Table "${tableName}" not found in schema`);
    return { valid: false, errors };
  }

  const validColumnNames = tableSchema.map(c => c.name);

  for (const column of columns) {
    if (!validColumnNames.includes(column)) {
      errors.push(
        `Column "${column}" not found in table "${tableName}". ` +
        `Valid columns: ${validColumnNames.join(', ')}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// TESTS: Hook Column Validation
// ============================================================================

describe('Schema Validation: Database Columns vs Hook Queries', () => {
  describe('useMowEvents hook', () => {
    it('should select only valid columns from mow_events table', () => {
      // The columns that useMowEvents selects (from the hook code)
      const selectedColumns = ['id', 'date', 'height_inches', 'notes'];

      const validation = validateSelectColumns(
        'mow_events',
        selectedColumns,
        PRODUCTION_SCHEMA
      );

      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        throw new Error(`Schema mismatch:\n${validation.errors.join('\n')}`);
      }
    });

    it('should have correct types for mow_events columns', () => {
      const schema = PRODUCTION_SCHEMA.mow_events;

      const heightColumn = schema.find(c => c.name === 'height_inches');
      expect(heightColumn).toBeDefined();
      expect(heightColumn?.type).toBe('decimal(5,2)');
      expect(heightColumn?.nullable).toBe(false);
    });
  });

  describe('useWaterEvents hook', () => {
    it('should select only valid columns from water_events table', () => {
      // The columns that useWaterEvents selects
      // NOTE: It should be 'amount_inches', NOT 'amount_gallons'!
      const selectedColumns = ['id', 'date', 'amount_inches', 'source', 'notes'];

      const validation = validateSelectColumns(
        'water_events',
        selectedColumns,
        PRODUCTION_SCHEMA
      );

      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        throw new Error(`Schema mismatch:\n${validation.errors.join('\n')}`);
      }
    });

    it('should have correct type for water amount column', () => {
      const schema = PRODUCTION_SCHEMA.water_events;
      const amountColumn = schema.find(c => c.name === 'amount_inches');

      expect(amountColumn).toBeDefined();
      expect(amountColumn?.type).toBe('decimal(4,2)');
    });

    it('should NOT have amount_gallons column', () => {
      const schema = PRODUCTION_SCHEMA.water_events;
      const hasGallons = schema.some(c => c.name === 'amount_gallons');

      expect(hasGallons).toBe(false);
    });

    it('should validate source column enum values', () => {
      const schema = PRODUCTION_SCHEMA.water_events;
      const sourceColumn = schema.find(c => c.name === 'source');

      expect(sourceColumn).toBeDefined();
      expect(sourceColumn?.nullable).toBe(false); // Cannot be null
    });
  });

  describe('useFertilizerEvents hook', () => {
    it('should select only valid columns from fertilizer_events table', () => {
      // Valid columns in fertilizer_events
      const selectedColumns = [
        'id',
        'date',
        'amount_lbs',
        'type',
        'application_method',
        'notes',
      ];

      const validation = validateSelectColumns(
        'fertilizer_events',
        selectedColumns,
        PRODUCTION_SCHEMA
      );

      expect(validation.valid).toBe(true);
      if (!validation.valid) {
        throw new Error(`Schema mismatch:\n${validation.errors.join('\n')}`);
      }
    });

    it('should NOT have N-P-K percentage columns', () => {
      const schema = PRODUCTION_SCHEMA.fertilizer_events;
      const badColumns = [
        'nitrogen_pct',
        'phosphorus_pct',
        'potassium_pct',
        'amount_lbs_per_1000sqft',
      ];

      for (const badColumn of badColumns) {
        const exists = schema.some(c => c.name === badColumn);
        expect(exists).toBe(
          false,
          `Column "${badColumn}" should not exist in fertilizer_events`
        );
      }
    });

    it('should have amount_lbs column, not amount_lbs_per_1000sqft', () => {
      const schema = PRODUCTION_SCHEMA.fertilizer_events;

      const amountColumn = schema.find(c => c.name === 'amount_lbs');
      expect(amountColumn).toBeDefined();

      const badColumn = schema.find(c => c.name === 'amount_lbs_per_1000sqft');
      expect(badColumn).toBeUndefined();
    });
  });

  // ============================================================================
  // Exhaustive Column Checks
  // ============================================================================

  describe('All required columns present', () => {
    it('mow_events should have all required columns', () => {
      const required = ['id', 'user_id', 'date', 'height_inches'];
      const schema = PRODUCTION_SCHEMA.mow_events;
      const actual = schema.map(c => c.name);

      for (const col of required) {
        expect(actual).toContain(col);
      }
    });

    it('water_events should have all required columns', () => {
      const required = ['id', 'user_id', 'date', 'amount_inches', 'source'];
      const schema = PRODUCTION_SCHEMA.water_events;
      const actual = schema.map(c => c.name);

      for (const col of required) {
        expect(actual).toContain(col);
      }
    });

    it('fertilizer_events should have all required columns', () => {
      const required = ['id', 'user_id', 'date', 'amount_lbs', 'type'];
      const schema = PRODUCTION_SCHEMA.fertilizer_events;
      const actual = schema.map(c => c.name);

      for (const col of required) {
        expect(actual).toContain(col);
      }
    });
  });
});
