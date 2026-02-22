import * as Yup from 'yup';

/**
 * Yup validation schema for Mowing events
 * Enforces:
 * - Date is required, in YYYY-MM-DD format, and not a future date
 * - Height is required, must be a positive number
 * - Notes are optional
 */
export const mowingEventSchema = Yup.object({
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
  height_inches: Yup.number()
    .required('Height is required')
    .positive('Height must be a positive number')
    .typeError('Height must be a valid number'),
  notes: Yup.string().optional(),
});

export type MowingFormValues = Yup.InferType<typeof mowingEventSchema>;
