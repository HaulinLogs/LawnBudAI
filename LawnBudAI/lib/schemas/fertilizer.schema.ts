import * as Yup from 'yup';

/**
 * Yup validation schema for Fertilizer events
 * Enforces:
 * - Date is required, in YYYY-MM-DD format, and not a future date
 * - Amount (lbs) is required, must be a positive number
 * - Type is required (nitrogen|phosphorus|potassium|npk|organic|liquid|granular)
 * - Application method is required (spreader|spray|liquid|granular)
 * - Notes are optional
 */
export const fertilizerEventSchema = Yup.object({
  date: Yup.string()
    .required('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .test('not-future', 'You cannot choose a future date', (value) => {
      if (!value) return true; // Will be caught by required()
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate <= today;
    }),
  amount_lbs: Yup.number()
    .required('Amount is required')
    .positive('Amount must be a positive number')
    .max(100, 'Amount must be 100 lbs or less')
    .typeError('Amount must be a valid number'),
  type: Yup.string()
    .oneOf(['nitrogen', 'phosphorus', 'potassium', 'npk', 'organic', 'liquid', 'granular'], 'Please select a valid fertilizer type')
    .required('Fertilizer type is required'),
  application_method: Yup.string()
    .oneOf(['spreader', 'spray', 'liquid', 'granular'], 'Please select a valid application method')
    .required('Application method is required'),
  notes: Yup.string().optional(),
});

export type FertilizerFormValues = {
  date: string;
  amount_lbs: string | number;
  type: 'nitrogen' | 'phosphorus' | 'potassium' | 'npk' | 'organic' | 'liquid' | 'granular' | string;
  application_method: 'spreader' | 'spray' | 'liquid' | 'granular' | string;
  notes: string;
};

export type FertilizerValidatedValues = Yup.InferType<typeof fertilizerEventSchema>;
