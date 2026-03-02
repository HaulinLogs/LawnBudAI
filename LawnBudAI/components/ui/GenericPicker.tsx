import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Represents a single option in the picker
 */
export interface PickerOption<T> {
  label: string;
  value: T;
  icon?: string;
}

/**
 * Props for the GenericPicker component
 */
export interface GenericPickerProps<T> {
  label: string;
  options: PickerOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * GenericPicker - A reusable picker component for selecting from a list of options
 *
 * @example
 * const [source, setSource] = useState('manual');
 * <GenericPicker
 *   label="Water Source"
 *   options={[
 *     { label: 'Sprinkler', value: 'sprinkler', icon: 'water' },
 *     { label: 'Manual', value: 'manual', icon: 'hand-right' },
 *   ]}
 *   value={source}
 *   onChange={setSource}
 * />
 */
export default function GenericPicker<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  testID,
}: GenericPickerProps<T>) {
  const [showPicker, setShowPicker] = useState(false);
  const themeColors = useAppTheme();
  const selectedOption = options.find(opt => opt.value === value);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: themeColors.textSecondary,
      marginBottom: 6,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: 8,
      marginBottom: 12,
      backgroundColor: themeColors.cardBackground,
    },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 16,
      color: themeColors.textPrimary,
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    buttonTextWithIcon: {
      marginLeft: 8,
    },
    option: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderTopWidth: 1,
      borderTopColor: themeColors.borderLight,
    },
    optionSelected: {
      backgroundColor: themeColors.highlight,
    },
    optionText: {
      fontSize: 16,
      color: themeColors.textPrimary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionTextSelected: {
      color: '#22c55e',
      fontWeight: '600',
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  }), [themeColors]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={() => !disabled && setShowPicker(!showPicker)}
          disabled={disabled}
          testID={testID}
        >
          <View style={styles.optionContent}>
            {selectedOption?.icon && (
              <Icon
                name={selectedOption.icon as any}
                size={16}
                color="#22c55e"
              />
            )}
            <Text style={[styles.buttonText, selectedOption?.icon && styles.buttonTextWithIcon]}>
              {selectedOption?.label || label}
            </Text>
          </View>
          <Icon
            name={showPicker ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={themeColors.textTertiary}
          />
        </TouchableOpacity>

        {showPicker && (
          <>
            {options.map(opt => (
              <TouchableOpacity
                key={String(opt.value)}
                style={[
                  styles.option,
                  value === opt.value && styles.optionSelected,
                ]}
                onPress={() => {
                  onChange(opt.value);
                  setShowPicker(false);
                }}
              >
                <View style={styles.optionContent}>
                  {opt.icon && (
                    <Icon
                      name={opt.icon as any}
                      size={16}
                      color={value === opt.value ? '#22c55e' : themeColors.textTertiary}
                    />
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      opt.icon && { marginLeft: 8 },
                      value === opt.value && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    </View>
  );
}
