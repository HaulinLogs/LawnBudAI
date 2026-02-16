import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface EventFormProps {
  date: string;
  onDateChange: (date: string) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  amountLabel: string;
  amountPlaceholder: string;
  amountKeyboardType?: 'decimal-pad' | 'numeric';
  notes: string;
  onNotesChange: (notes: string) => void;
  optionalField?: ReactNode;
  submitLabel: string;
  onSubmit: () => void;
  submitting: boolean;
  disabled?: boolean;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function EventForm({
  date,
  onDateChange,
  amount,
  onAmountChange,
  amountLabel,
  amountPlaceholder,
  amountKeyboardType = 'decimal-pad',
  notes,
  onNotesChange,
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
        editable={!isDisabled}
      />

      <Text style={styles.label}>{amountLabel}</Text>
      <TextInput
        style={styles.input}
        placeholder={amountPlaceholder}
        value={amount}
        onChangeText={onAmountChange}
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
