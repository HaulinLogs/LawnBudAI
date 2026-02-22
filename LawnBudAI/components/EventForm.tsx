import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { colors, spacing, borderRadius, typography } from '@/styles/theme';

interface EventFormProps {
  date: string;
  onDateChange: (date: string) => void;
  onDateBlur?: () => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  onAmountBlur?: () => void;
  amountLabel: string;
  amountPlaceholder: string;
  amountKeyboardType?: 'decimal-pad' | 'numeric';
  notes: string;
  onNotesChange: (notes: string) => void;
  onNotesBlur?: () => void;
  optionalField?: ReactNode;
  submitLabel: string;
  onSubmit: () => void;
  submitting: boolean;
  disabled?: boolean;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 10,
    fontSize: 16,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center' as const,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

export default function EventForm({
  date,
  onDateChange,
  onDateBlur,
  amount,
  onAmountChange,
  onAmountBlur,
  amountLabel,
  amountPlaceholder,
  amountKeyboardType = 'decimal-pad',
  notes,
  onNotesChange,
  onNotesBlur,
  optionalField,
  submitLabel,
  onSubmit,
  submitting,
  disabled = false,
}: EventFormProps) {
  const isDisabled = disabled || submitting;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={onDateChange}
        onBlur={onDateBlur}
        editable={!isDisabled}
      />

      <Text style={styles.label}>{amountLabel}</Text>
      <TextInput
        style={styles.input}
        placeholder={amountPlaceholder}
        value={amount}
        onChangeText={onAmountChange}
        onBlur={onAmountBlur}
        keyboardType={amountKeyboardType}
        editable={!isDisabled}
      />

      {optionalField}

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="Any notes..."
        value={notes}
        onChangeText={onNotesChange}
        onBlur={onNotesBlur}
        multiline
        numberOfLines={4}
        editable={!isDisabled}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isDisabled}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
