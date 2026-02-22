#!/usr/bin/env node

/**
 * Pre-Deployment Schema Validator
 *
 * CRITICAL: This script validates that all database SELECT statements in hooks
 * match the actual database schema. It prevents schema mismatch bugs from reaching
 * production.
 *
 * Exit codes:
 *   0 = All validations passed
 *   1 = Schema mismatches found (BLOCK DEPLOYMENT)
 */

const fs = require('fs');
const path = require('path');

// SOURCE OF TRUTH: Database schema from migrations
const PRODUCTION_SCHEMA = {
  mow_events: [
    'id',
    'user_id',
    'date',
    'height_inches',
    'notes',
    'created_at',
    'updated_at',
  ],
  water_events: [
    'id',
    'user_id',
    'date',
    'amount_inches',
    'source',
    'notes',
    'created_at',
    'updated_at',
  ],
  fertilizer_events: [
    'id',
    'user_id',
    'date',
    'amount_lbs',
    'type',
    'application_method',
    'notes',
    'created_at',
    'updated_at',
  ],
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Defines which columns each hook is allowed to select
 * These are the ONLY columns that should appear in SELECT statements
 */
const ALLOWED_SELECTIONS = {
  useMowEvents: {
    file: 'hooks/useMowEvents.ts',
    table: 'mow_events',
    // These are the columns that make sense to select for display/use
    allowedColumns: ['id', 'date', 'height_inches', 'notes'],
    selectPatterns: [/\.select\(['"]([^'"]+)['"]\)/g],
  },
  useWaterEvents: {
    file: 'hooks/useWaterEvents.ts',
    table: 'water_events',
    allowedColumns: ['id', 'date', 'amount_inches', 'source', 'notes'],
    selectPatterns: [/\.select\(['"]([^'"]+)['"]\)/g],
  },
  useFertilizerEvents: {
    file: 'hooks/useFertilizerEvents.ts',
    table: 'fertilizer_events',
    allowedColumns: ['id', 'date', 'amount_lbs', 'type', 'application_method', 'notes'],
    selectPatterns: [/\.select\(['"]([^'"]+)['"]\)/g],
  },
};

// ============================================================================
// ERROR REPORTING
// ============================================================================

class ValidationError {
  constructor(hook, issue, details) {
    this.hook = hook;
    this.issue = issue;
    this.details = details;
  }

  toString() {
    return `❌ ${this.hook}: ${this.issue}\n   ${this.details}`;
  }

  toJSON() {
    return {
      hook: this.hook,
      issue: this.issue,
      details: this.details,
      severity: 'ERROR',
      blocksDeploy: true,
    };
  }
}

// ============================================================================
// VALIDATION LOGIC
// ============================================================================

/**
 * Extract SELECT column names from hook file
 */
function extractSelectColumns(hookFile, patterns) {
  const fileContent = fs.readFileSync(hookFile, 'utf8');
  const matches = [];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(fileContent)) !== null) {
      const columnsString = match[1];
      // Split by comma and trim, handle both quoted and unquoted
      const columns = columnsString
        .split(',')
        .map(col => col.trim().replace(/['"]/g, ''))
        .filter(col => col && col !== '*');

      if (columns.length > 0) {
        matches.push(...columns);
      }
    }
  }

  return [...new Set(matches)]; // Remove duplicates
}

/**
 * Validate hook's SELECT statement against schema
 */
function validateHook(hookName, config) {
  const hookPath = path.join(process.cwd(), config.file);

  if (!fs.existsSync(hookPath)) {
    return new ValidationError(
      hookName,
      'Hook file not found',
      `Expected file: ${config.file}`
    );
  }

  const selectedColumns = extractSelectColumns(hookPath, config.selectPatterns);

  if (selectedColumns.length === 0) {
    // Using SELECT * is acceptable
    return null;
  }

  const schemaColumns = PRODUCTION_SCHEMA[config.table];
  const invalidColumns = selectedColumns.filter(
    col => !schemaColumns.includes(col)
  );

  if (invalidColumns.length > 0) {
    return new ValidationError(
      hookName,
      'Invalid column names in SELECT statement',
      `Invalid columns: ${invalidColumns.join(', ')}\n` +
        `   Valid columns for ${config.table}: ${schemaColumns.join(', ')}\n` +
        `   File: ${config.file}`
    );
  }

  // Warn if selecting columns that don't exist in schema but were being used
  const commonMistakes = {
    useMowEvents: ['height_feet', 'height_cm'],
    useWaterEvents: [
      'amount_gallons',
      'amount_mm',
      'amount_liters',
      'watering_frequency',
    ],
    useFertilizerEvents: [
      'nitrogen_pct',
      'phosphorus_pct',
      'potassium_pct',
      'amount_lbs_per_1000sqft',
      'npk_ratio',
      'application_form',
    ],
  };

  const mistakes = commonMistakes[hookName] || [];
  for (const mistake of mistakes) {
    if (selectedColumns.includes(mistake)) {
      return new ValidationError(
        hookName,
        `CRITICAL: Obsolete column name "${mistake}" in SELECT`,
        `This column does not exist in ${config.table}.\n` +
          `   File: ${config.file}\n` +
          `   Action: Remove this column from SELECT statement or use the correct column name`
      );
    }
  }

  return null; // Validation passed
}

/**
 * Validate TypeScript models match schema
 */
function validateModels() {
  const modelsFile = path.join(process.cwd(), 'models/events.ts');

  if (!fs.existsSync(modelsFile)) {
    return new ValidationError(
      'Models',
      'Events model file not found',
      `Expected: models/events.ts`
    );
  }

  const modelContent = fs.readFileSync(modelsFile, 'utf8');
  const criticalFields = {
    WaterEvent: [
      { field: 'amount_inches', deprecated: ['amount_gallons'] },
      { field: 'source', deprecated: [] },
    ],
    FertilizerEvent: [
      { field: 'amount_lbs', deprecated: ['amount_lbs_per_1000sqft'] },
      {
        field: 'type',
        deprecated: ['nitrogen_pct', 'phosphorus_pct', 'potassium_pct'],
      },
    ],
  };

  const errors = [];

  for (const [model, fields] of Object.entries(criticalFields)) {
    for (const { field, deprecated } of fields) {
      for (const oldField of deprecated) {
        if (modelContent.includes(oldField)) {
          errors.push(
            new ValidationError(
              'Models',
              `Obsolete field "${oldField}" found in ${model}`,
              `Use "${field}" instead\n` +
                `   File: models/events.ts\n` +
                `   Action: Replace all "${oldField}" with "${field}"`
            )
          );
        }
      }
    }
  }

  return errors.length > 0 ? errors[0] : null;
}

// ============================================================================
// MAIN VALIDATION
// ============================================================================

function main() {
  console.log('🔍 Running pre-deployment schema validation...\n');

  const errors = [];

  // Validate each hook
  for (const [hookName, config] of Object.entries(ALLOWED_SELECTIONS)) {
    const error = validateHook(hookName, config);
    if (error) {
      errors.push(error);
    }
  }

  // Validate models
  const modelError = validateModels();
  if (modelError) {
    errors.push(modelError);
  }

  // ========================================================================
  // REPORT RESULTS
  // ========================================================================

  if (errors.length === 0) {
    console.log('✅ All schema validations passed!');
    console.log('   - All SELECT statements match database schema');
    console.log('   - All TypeScript models are in sync');
    console.log('   - Ready for deployment\n');
    process.exit(0);
  } else {
    console.log('❌ SCHEMA VALIDATION FAILED - DEPLOYMENT BLOCKED\n');
    console.log('Issues found:\n');

    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
      console.log();
    });

    console.log('📋 Schema Reference:\n');
    for (const [table, columns] of Object.entries(PRODUCTION_SCHEMA)) {
      console.log(`   ${table}: ${columns.join(', ')}`);
    }

    console.log(
      '\n📖 For details, see: docs/DATABASE_SCHEMA.md or supabase/migrations/\n'
    );

    // Output JSON for CI parsing
    console.log('---JSON-START---');
    console.log(
      JSON.stringify(
        {
          success: false,
          validationsPassed: 0,
          validationsFailed: errors.length,
          errors: errors.map(e => e.toJSON()),
          schema: PRODUCTION_SCHEMA,
        },
        null,
        2
      )
    );
    console.log('---JSON-END---');

    process.exit(1);
  }
}

main();
