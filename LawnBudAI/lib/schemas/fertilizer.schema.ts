// eslint-disable-next-line import/no-unresolved
import * as Yup from 'yup';

/**
 * Yup validation schema for Fertilizer events
 * Enforces:
 * - Date is required, in YYYY-MM-DD format, and not a future date
 * - Amount is required, must be a positive number
 * - Nitrogen, Phosphorus, Potassium each required, 0-100%
 * - Application form is required (liquid|granular)
 * - Application method is required (broadcast|spot|edge|custom)
 * - Notes are optional
 *
 * Note: NPK total > 100% is allowed (shows warning but doesn't block submission)
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
  amount_lbs_per_1000sqft: Yup.number()
    .required('Amount is required')
    .positive('Amount must be a positive number')
    .typeError('Amount must be a valid number'),
  nitrogen_pct: Yup.number()
    .required('Nitrogen is required')
    .min(0, 'Nitrogen must be 0 or greater')
    .max(100, 'Nitrogen must be 100 or less')
    .typeError('Nitrogen must be a valid number'),
  phosphorus_pct: Yup.number()
    .required('Phosphorus is required')
    .min(0, 'Phosphorus must be 0 or greater')
    .max(100, 'Phosphorus must be 100 or less')
    .typeError('Phosphorus must be a valid number'),
  potassium_pct: Yup.number()
    .required('Potassium is required')
    .min(0, 'Potassium must be 0 or greater')
    .max(100, 'Potassium must be 100 or less')
    .typeError('Potassium must be a valid number'),
  application_form: Yup.string()
    .oneOf(['liquid', 'granular'], 'Please select a valid application form')
    .required('Application form is required'),
  application_method: Yup.string()
    .oneOf(['broadcast', 'spot', 'edge', 'custom'], 'Please select a valid application method')
    .required('Application method is required'),
  notes: Yup.string().optional(),
});

export type FertilizerFormValues = Yup.InferType<typeof fertilizerEventSchema>;
