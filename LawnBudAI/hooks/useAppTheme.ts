/**
 * Central theme hook for the LawnBudAI app.
 * Returns semantically-named colors appropriate for the current color scheme,
 * ensuring WCAG-compliant contrast in both light and dark modes.
 */

import { useColorScheme } from '@/hooks/useColorScheme';

const lightColors = {
  // Backgrounds
  screenBackground: '#f9fafb',
  screenBackgroundGreen: '#ecfdf5',
  cardBackground: '#ffffff',
  inputBackground: '#fafafa',
  statBoxBackground: '#f3f4f6',
  eventItemBackground: '#f3f4f6',
  highlightGreen: '#d1fae5',
  highlight: '#f0fdf4',
  reminderBackground: '#d1fae5',

  // Text
  textPrimary: '#1f2937',
  textSecondary: '#374151',
  textTertiary: '#6b7280',
  headerText: '#064e3b',
  subHeaderText: '#047857',
  settingsLabel: '#064e3b',
  reminderTitle: '#065f46',
  forecastDate: '#065f46',
  forecastTemp: '#333333',
  forecastTempSmall: '#666666',
  placeholderText: '#999999',

  // Borders
  border: '#d1d5db',
  borderLight: '#e5e7eb',
  inputBorder: '#d1fae5',

  // Brand
  primary: '#22c55e',

  // Status
  error: '#dc2626',
  errorBackground: '#fee2e2',
  errorBorder: '#fecaca',
  errorText: '#991b1b',
  success: '#22c55e',
  warning: '#f97316',

  // Sign out
  signOutBackground: '#fee2e2',
  signOutBorder: '#fecaca',
  signOutText: '#dc2626',

  // Plan / Settings
  planCardBackground: '#ffffff',
  planCardBorder: '#e5e7eb',
  planTitle: '#1f2937',
  planDescription: '#6b7280',

  // Premium Gate
  premiumBackground: '#f9fafb',
  premiumCard: '#ffffff',
  premiumTitle: '#1f2937',
  premiumDescription: '#6b7280',
  premiumBenefit: '#4b5563',
  premiumDismiss: '#9ca3af',
};

const darkColors = {
  // Backgrounds
  screenBackground: '#151718',
  screenBackgroundGreen: '#0a1a0a',
  cardBackground: '#1c1f21',
  inputBackground: '#1f2937',
  statBoxBackground: '#1f2937',
  eventItemBackground: '#1f2937',
  highlightGreen: '#14532d',
  highlight: '#14532d',
  reminderBackground: '#14532d',

  // Text
  textPrimary: '#e5e7eb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  headerText: '#4ade80',
  subHeaderText: '#6ee7b7',
  settingsLabel: '#4ade80',
  reminderTitle: '#4ade80',
  forecastDate: '#4ade80',
  forecastTemp: '#e5e7eb',
  forecastTempSmall: '#9ca3af',
  placeholderText: '#6b7280',

  // Borders
  border: '#374151',
  borderLight: '#374151',
  inputBorder: '#374151',

  // Brand
  primary: '#22c55e',

  // Status
  error: '#f87171',
  errorBackground: '#450a0a',
  errorBorder: '#7f1d1d',
  errorText: '#fca5a5',
  success: '#4ade80',
  warning: '#fb923c',

  // Sign out
  signOutBackground: '#450a0a',
  signOutBorder: '#7f1d1d',
  signOutText: '#fca5a5',

  // Plan / Settings
  planCardBackground: '#1c1f21',
  planCardBorder: '#374151',
  planTitle: '#e5e7eb',
  planDescription: '#9ca3af',

  // Premium Gate
  premiumBackground: '#151718',
  premiumCard: '#1c1f21',
  premiumTitle: '#e5e7eb',
  premiumDescription: '#9ca3af',
  premiumBenefit: '#d1d5db',
  premiumDismiss: '#6b7280',
};

export type AppThemeColors = typeof lightColors;

export function useAppTheme(): AppThemeColors {
  const scheme = useColorScheme() ?? 'light';
  return scheme === 'dark' ? darkColors : lightColors;
}
