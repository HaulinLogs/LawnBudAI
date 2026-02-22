import * as Yup from 'yup';

/**
 * Yup validation schema for Watering events
 * Enforces:
 * - Date is required, in YYYY-MM-DD format, and not a future date
 * - Amount is required, must be a positive number
 * - Source is required, must be one of: sprinkler, manual, rain
 * - Notes are optional
 */
export const wateringEventSchema = Yup.object({
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
  amount_gallons: Yup.number()
    .required('Amount is required')
    .positive('Amount must be a positive number')
    .typeError('Amount must be a valid number'),
  source: Yup.string()
    .oneOf(['sprinkler', 'manual', 'rain'], 'Please select a valid source')
    .required('Source is required'),
  notes: Yup.string().optional(),
});

export type WateringFormValues = Yup.InferType<typeof wateringEventSchema>;
