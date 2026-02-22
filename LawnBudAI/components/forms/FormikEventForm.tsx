import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { FormikProps } from 'formik';
import EventForm from '@/components/EventForm';
import { spacing, typography } from '@/styles/theme';

interface FieldNameMap {
  date: string;
  amount: string;
  notes: string;
}

interface FormikEventFormProps<T> {
  formik: FormikProps<T>;
  fieldNames: FieldNameMap;
  amountLabel: string;
  amountPlaceholder: string;
  amountKeyboardType?: 'decimal-pad' | 'numeric';
  submitLabel: string;
  optionalField?: React.ReactNode;
}

const styles = StyleSheet.create({
  errorContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.errorText,
  },
});

/**
 * FormikEventForm - Wrapper component that integrates Formik with EventForm
 *
 * This component provides:
 * - Formik-powered form state management
 * - Real-time validation (on change and blur)
 * - Inline error messages displayed below fields
 * - Disabled submit button when form is invalid
 * - Type-safe field mapping
 *
 * Usage:
 * ```tsx
 * const formik = useFormik({
 *   initialValues: { date: '', height_inches: '', notes: '' },
 *   validationSchema: mowingEventSchema,
 *   onSubmit: async (values) => { ... }
 * });
 *
 * <FormikEventForm
 *   formik={formik}
 *   fieldNames={{ date: 'date', amount: 'height_inches', notes: 'notes' }}
 *   amountLabel="Height (inches)"
 *   submitLabel="Record Mowing"
 * />
 * ```
 */
export default function FormikEventForm<T>({
  formik,
  fieldNames,
  amountLabel,
  amountPlaceholder,
  amountKeyboardType = 'decimal-pad',
  submitLabel,
  optionalField,
}: FormikEventFormProps<T>) {
  const dateField = fieldNames.date as keyof T;
  const amountField = fieldNames.amount as keyof T;
  const notesField = fieldNames.notes as keyof T;

  const dateError = formik.touched[dateField] && formik.errors[dateField];
  const amountError = formik.touched[amountField] && formik.errors[amountField];
  const notesError = formik.touched[notesField] && formik.errors[notesField];

  return (
    <>
      <EventForm
        date={String(formik.values[dateField] || '')}
        onDateChange={(value) => {
          formik.setFieldValue(String(dateField), value);
        }}
        onDateBlur={() => {
          formik.setFieldTouched(String(dateField), true);
        }}
        amount={String(formik.values[amountField] || '')}
        onAmountChange={(value) => {
          formik.setFieldValue(String(amountField), value);
        }}
        onAmountBlur={() => {
          formik.setFieldTouched(String(amountField), true);
        }}
        amountLabel={amountLabel}
        amountPlaceholder={amountPlaceholder}
        amountKeyboardType={amountKeyboardType}
        notes={String(formik.values[notesField] || '')}
        onNotesChange={(value) => {
          formik.setFieldValue(String(notesField), value);
        }}
        onNotesBlur={() => {
          formik.setFieldTouched(String(notesField), true);
        }}
        optionalField={optionalField}
        submitLabel={submitLabel}
        onSubmit={formik.handleSubmit}
        submitting={formik.isSubmitting}
        disabled={!formik.isValid || formik.isSubmitting}
      />

      {/* Inline error messages displayed below form */}
      {dateError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{String(dateError)}</Text>
        </View>
      )}
      {amountError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{String(amountError)}</Text>
        </View>
      )}
      {notesError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{String(notesError)}</Text>
        </View>
      )}
    </>
  );
}
