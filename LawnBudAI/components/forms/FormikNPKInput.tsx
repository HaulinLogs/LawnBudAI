import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { FormikProps } from 'formik';
import { spacing, typography, colors, borderRadius } from '@/styles/theme';

interface FormikNPKInputProps<T> {
  formik: FormikProps<T>;
  nitrogenField: string;
  phosphorusField: string;
  potassiumField: string;
  showNPKWarning?: boolean;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  npkInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  npkInputWrapper: {
    flex: 1,
  },
  npkInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  npkInputError: {
    borderColor: colors.error,
  },
  npkLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center' as const,
  },
  errorText: {
    ...typography.errorText,
    marginLeft: 0,
  },
  warningText: {
    ...typography.warningText,
    marginLeft: 0,
  },
  warningContainer: {
    marginTop: spacing.sm,
  },
});

/**
 * FormikNPKInput - Component for N-P-K trio input with Formik integration
 *
 * Renders three TextInputs for Nitrogen, Phosphorus, and Potassium percentages.
 * Handles validation errors for each field individually.
 * Can optionally display NPK total warning when sum > 100%.
 */
export default function FormikNPKInput<T>({
  formik,
  nitrogenField,
  phosphorusField,
  potassiumField,
  showNPKWarning = true,
}: FormikNPKInputProps<T>) {
  const nitrogen = String(formik.values[nitrogenField as keyof T] || '');
  const phosphorus = String(formik.values[phosphorusField as keyof T] || '');
  const potassium = String(formik.values[potassiumField as keyof T] || '');

  const nitrogenError = formik.touched[nitrogenField as keyof T] && formik.errors[nitrogenField as keyof T];
  const phosphorusError = formik.touched[phosphorusField as keyof T] && formik.errors[phosphorusField as keyof T];
  const potassiumError = formik.touched[potassiumField as keyof T] && formik.errors[potassiumField as keyof T];

  // Calculate NPK total for warning
  const npkTotal = useMemo(() => {
    const n = parseFloat(nitrogen) || 0;
    const p = parseFloat(phosphorus) || 0;
    const k = parseFloat(potassium) || 0;
    return n + p + k;
  }, [nitrogen, phosphorus, potassium]);

  const npkWarning = showNPKWarning && npkTotal > 100
    ? `N-P-K total is ${npkTotal.toFixed(1)}% (exceeds 100%)`
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>N-P-K Ratio (%)</Text>

      <View style={styles.npkInputContainer}>
        <View style={styles.npkInputWrapper}>
          <TextInput
            style={[
              styles.npkInput,
              nitrogenError && styles.npkInputError,
            ]}
            placeholder="N"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={nitrogen}
            onChangeText={(value) => formik.setFieldValue(nitrogenField, value)}
            onBlur={() => formik.setFieldTouched(nitrogenField, true)}
            maxLength={6}
          />
          <Text style={styles.npkLabel}>Nitrogen</Text>
          {nitrogenError && (
            <Text style={styles.errorText}>{String(nitrogenError)}</Text>
          )}
        </View>

        <View style={styles.npkInputWrapper}>
          <TextInput
            style={[
              styles.npkInput,
              phosphorusError && styles.npkInputError,
            ]}
            placeholder="P"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={phosphorus}
            onChangeText={(value) => formik.setFieldValue(phosphorusField, value)}
            onBlur={() => formik.setFieldTouched(phosphorusField, true)}
            maxLength={6}
          />
          <Text style={styles.npkLabel}>Phosphorus</Text>
          {phosphorusError && (
            <Text style={styles.errorText}>{String(phosphorusError)}</Text>
          )}
        </View>

        <View style={styles.npkInputWrapper}>
          <TextInput
            style={[
              styles.npkInput,
              potassiumError && styles.npkInputError,
            ]}
            placeholder="K"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={potassium}
            onChangeText={(value) => formik.setFieldValue(potassiumField, value)}
            onBlur={() => formik.setFieldTouched(potassiumField, true)}
            maxLength={6}
          />
          <Text style={styles.npkLabel}>Potassium</Text>
          {potassiumError && (
            <Text style={styles.errorText}>{String(potassiumError)}</Text>
          )}
        </View>
      </View>

      {npkWarning && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>⚠️ {npkWarning}</Text>
        </View>
      )}
    </View>
  );
}
