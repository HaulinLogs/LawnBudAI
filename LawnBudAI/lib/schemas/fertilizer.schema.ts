import * as Yup from 'yup';

/**
 * Yup validation schema for Fertilizer events
 * Enforces:
 * - Date is required, in YYYY-MM-DD format, and not a future date
 * - Amount (lbs) is required, must be a positive number
 * - nitrogen_pct, phosphorus_pct, potassium_pct are optional 0-100% values
 * - application_form is required (granular|liquid)
 * - application_method is required (broadcast|spot|edge|custom|spray)
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
  nitrogen_pct: Yup.number()
    .min(0, 'Nitrogen must be 0% or more')
    .max(100, 'Nitrogen must be 100% or less')
    .typeError('Nitrogen must be a valid number')
    .optional(),
  phosphorus_pct: Yup.number()
    .min(0, 'Phosphorus must be 0% or more')
    .max(100, 'Phosphorus must be 100% or less')
    .typeError('Phosphorus must be a valid number')
    .optional(),
  potassium_pct: Yup.number()
    .min(0, 'Potassium must be 0% or more')
    .max(100, 'Potassium must be 100% or less')
    .typeError('Potassium must be a valid number')
    .optional(),
  application_form: Yup.string()
    .oneOf(['granular', 'liquid'], 'Please select a valid application form')
    .required('Application form is required'),
  application_method: Yup.string()
    .oneOf(['broadcast', 'spot', 'edge', 'custom', 'spray'], 'Please select a valid application method')
    .required('Application method is required'),
  notes: Yup.string().optional(),
});

export type FertilizerFormValues = {
  date: string;
  amount_lbs: string | number;
  nitrogen_pct: string | number;
  phosphorus_pct: string | number;
  potassium_pct: string | number;
  application_form: 'granular' | 'liquid' | string;
  application_method: 'broadcast' | 'spot' | 'edge' | 'custom' | 'spray' | string;
  notes: string;
};

export type FertilizerValidatedValues = Yup.InferType<typeof fertilizerEventSchema>;
