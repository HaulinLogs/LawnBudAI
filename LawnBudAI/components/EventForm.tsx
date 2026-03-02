import React, { ReactNode, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { spacing, borderRadius } from '@/styles/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

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
  const themeColors = useAppTheme();
  const isDisabled = disabled || submitting;

  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: themeColors.cardBackground,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: themeColors.borderLight,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: themeColors.textSecondary,
      marginBottom: spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: borderRadius.sm,
      padding: 10,
      fontSize: 16,
      marginBottom: spacing.md,
      color: themeColors.textPrimary,
      backgroundColor: themeColors.inputBackground,
    },
    button: {
      backgroundColor: themeColors.primary,
      paddingVertical: 12,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.sm,
      alignItems: 'center' as const,
    },
    buttonDisabled: {
      backgroundColor: themeColors.border,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600' as const,
    },
  }), [themeColors]);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={themeColors.placeholderText}
        value={date}
        onChangeText={onDateChange}
        onBlur={onDateBlur}
        editable={!isDisabled}
      />

      <Text style={styles.label}>{amountLabel}</Text>
      <TextInput
        style={styles.input}
        placeholder={amountPlaceholder}
        placeholderTextColor={themeColors.placeholderText}
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
        placeholderTextColor={themeColors.placeholderText}
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
