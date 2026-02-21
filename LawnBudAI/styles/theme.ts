/**
 * Centralized theme constants for the LawnBudAI app
 * Extracted from all screens to ensure visual consistency
 */

/**
 * Color palette used throughout the app
 */
export const colors = {
  // Primary brand color (green)
  primary: '#22c55e',

  // Backgrounds
  background: '#f9fafb',
  white: '#fff',

  // Text colors
  textPrimary: '#1f2937',
  textSecondary: '#374151',
  textTertiary: '#6b7280',

  // Borders and dividers
  border: '#d1d5db',
  borderLight: '#e5e7eb',

  // UI states
  success: '#22c55e',
  warning: '#f97316',
  error: '#ef4444',
  disabled: '#d1d5db',

  // Highlights
  highlight: '#f0fdf4',
};

/**
 * Spacing scale (in pixels)
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

/**
 * Border radius values
 */
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

/**
 * Typography styles
 */
export const typography = {
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  bodyText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  smallText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
};

/**
 * Common container styles
 */
export const containers = {
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  section: {
    marginBottom: spacing.xl,
  },
};

/**
 * Input styles
 */
export const inputs = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: borderRadius.sm,
  paddingVertical: 10,
  paddingHorizontal: spacing.md,
  fontSize: 16,
  color: colors.textPrimary,
};

/**
 * Button styles
 */
export const buttons = {
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center' as const,
  },
  primaryDisabled: {
    backgroundColor: colors.disabled,
  },
  primaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
};
