/**
 * Tests for Yup validation schemas
 *
 * Covers mowing, watering, and fertilizer event schemas — valid data,
 * missing required fields, out-of-range values, bad formats, and
 * invalid enum values.
 *
 * NOTE: jest.unmock('yup') is hoisted by babel-jest, so it takes effect
 * before imports despite appearing later in source order.
 */

import { mowingEventSchema } from '@/lib/schemas/mowing.schema';
import { wateringEventSchema } from '@/lib/schemas/watering.schema';
import { fertilizerEventSchema } from '@/lib/schemas/fertilizer.schema';

// Yup is auto-mocked via __mocks__/yup.ts; unmock to use real validation
jest.unmock('yup');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TODAY = new Date();
const todayStr = TODAY.toISOString().slice(0, 10); // YYYY-MM-DD

const futureDate = new Date(TODAY);
futureDate.setDate(futureDate.getDate() + 5);
const futureDateStr = futureDate.toISOString().slice(0, 10);

// ---------------------------------------------------------------------------
// mowingEventSchema
// ---------------------------------------------------------------------------

describe('mowingEventSchema', () => {
  const valid = { date: todayStr, height_inches: 3, notes: '' };

  it('passes with valid data', async () => {
    await expect(mowingEventSchema.validate(valid)).resolves.toBeDefined();
  });

  it('fails when date is missing', async () => {
    await expect(mowingEventSchema.validate({ ...valid, date: '' })).rejects.toThrow('Date is required');
  });

  it('fails when date format is wrong', async () => {
    await expect(mowingEventSchema.validate({ ...valid, date: '15/03/2024' })).rejects.toThrow(
      'Date must be in YYYY-MM-DD format',
    );
  });

  it('fails when date is in the future', async () => {
    await expect(mowingEventSchema.validate({ ...valid, date: futureDateStr })).rejects.toThrow(
      'You cannot choose a future date',
    );
  });

  it('fails when height_inches is missing', async () => {
    await expect(mowingEventSchema.validate({ ...valid, height_inches: undefined })).rejects.toThrow();
  });

  it('fails when height_inches is negative', async () => {
    await expect(mowingEventSchema.validate({ ...valid, height_inches: -1 })).rejects.toThrow(
      'Height must be a positive number',
    );
  });

  it('fails when height_inches is not a number', async () => {
    await expect(mowingEventSchema.validate({ ...valid, height_inches: 'abc' })).rejects.toThrow(
      'Height must be a valid number',
    );
  });

  it('passes with optional notes omitted', async () => {
    const { notes: _n, ...withoutNotes } = valid;
    await expect(mowingEventSchema.validate(withoutNotes)).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// wateringEventSchema
// ---------------------------------------------------------------------------

describe('wateringEventSchema', () => {
  const valid = { date: todayStr, amount_inches: 0.5, source: 'sprinkler', notes: '' };

  it('passes with valid data', async () => {
    await expect(wateringEventSchema.validate(valid)).resolves.toBeDefined();
  });

  it('fails when date is missing', async () => {
    await expect(wateringEventSchema.validate({ ...valid, date: '' })).rejects.toThrow('Date is required');
  });

  it('fails when date is in the future', async () => {
    await expect(wateringEventSchema.validate({ ...valid, date: futureDateStr })).rejects.toThrow(
      'You cannot choose a future date',
    );
  });

  it('fails when amount_inches is zero', async () => {
    await expect(wateringEventSchema.validate({ ...valid, amount_inches: 0 })).rejects.toThrow(
      'Amount must be a positive number',
    );
  });

  it('fails when amount_inches is not a number', async () => {
    await expect(wateringEventSchema.validate({ ...valid, amount_inches: 'lots' })).rejects.toThrow(
      'Amount must be a valid number',
    );
  });

  it('fails when source is not in enum', async () => {
    await expect(wateringEventSchema.validate({ ...valid, source: 'hose' })).rejects.toThrow(
      'Please select a valid source',
    );
  });

  it('passes with source "manual"', async () => {
    await expect(wateringEventSchema.validate({ ...valid, source: 'manual' })).resolves.toBeDefined();
  });

  it('passes with source "rain"', async () => {
    await expect(wateringEventSchema.validate({ ...valid, source: 'rain' })).resolves.toBeDefined();
  });

  it('fails when source is missing', async () => {
    await expect(wateringEventSchema.validate({ ...valid, source: undefined })).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// fertilizerEventSchema
// ---------------------------------------------------------------------------

describe('fertilizerEventSchema', () => {
  const valid = {
    date: todayStr,
    amount_lbs: 10,
    type: 'npk',
    application_method: 'spreader',
    notes: '',
  };

  it('passes with valid data', async () => {
    await expect(fertilizerEventSchema.validate(valid)).resolves.toBeDefined();
  });

  it('fails when date is missing', async () => {
    await expect(fertilizerEventSchema.validate({ ...valid, date: '' })).rejects.toThrow('Date is required');
  });

  it('fails when date is in the future', async () => {
    await expect(fertilizerEventSchema.validate({ ...valid, date: futureDateStr })).rejects.toThrow(
      'You cannot choose a future date',
    );
  });

  it('fails when amount_lbs is zero', async () => {
    await expect(fertilizerEventSchema.validate({ ...valid, amount_lbs: 0 })).rejects.toThrow(
      'Amount must be a positive number',
    );
  });

  it('fails when amount_lbs exceeds 100', async () => {
    await expect(fertilizerEventSchema.validate({ ...valid, amount_lbs: 101 })).rejects.toThrow(
      'Amount must be 100 lbs or less',
    );
  });

  it('fails when amount_lbs is not a number', async () => {
    await expect(fertilizerEventSchema.validate({ ...valid, amount_lbs: 'many' })).rejects.toThrow(
      'Amount must be a valid number',
    );
  });

  it('fails when type is not in enum', async () => {
    await expect(fertilizerEventSchema.validate({ ...valid, type: 'synthetic' })).rejects.toThrow(
      'Please select a valid fertilizer type',
    );
  });

  it('passes with each valid fertilizer type', async () => {
    const types = ['nitrogen', 'phosphorus', 'potassium', 'npk', 'organic', 'liquid', 'granular'];
    for (const type of types) {
      await expect(fertilizerEventSchema.validate({ ...valid, type })).resolves.toBeDefined();
    }
  });

  it('fails when application_method is not in enum', async () => {
    await expect(
      fertilizerEventSchema.validate({ ...valid, application_method: 'hand' }),
    ).rejects.toThrow('Please select a valid application method');
  });

  it('passes with each valid application method', async () => {
    const methods = ['spreader', 'spray', 'liquid', 'granular'];
    for (const application_method of methods) {
      await expect(fertilizerEventSchema.validate({ ...valid, application_method })).resolves.toBeDefined();
    }
  });

  it('fails when type is missing', async () => {
    await expect(fertilizerEventSchema.validate({ ...valid, type: undefined })).rejects.toThrow();
  });

  it('fails when application_method is missing', async () => {
    await expect(fertilizerEventSchema.validate({ ...valid, application_method: undefined })).rejects.toThrow();
  });
});
