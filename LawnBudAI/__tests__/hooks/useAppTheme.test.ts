/**
 * Tests for useAppTheme hook
 *
 * Verifies that the hook returns the correct semantic colour palette for each
 * effective colour scheme, and that the light / dark palettes are structurally
 * consistent (identical keys) while having distinct values where contrast
 * matters most.
 */

import { renderHook } from '@testing-library/react-native';
import { useAppTheme, lightColors, darkColors } from '@/hooks/useAppTheme';
import { useThemeMode } from '@/contexts/ThemeContext';

jest.mock('@/contexts/ThemeContext', () => ({
  useThemeMode: jest.fn(),
}));

const mockUseThemeMode = useThemeMode as jest.Mock;

describe('useAppTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Palette selection ────────────────────────────────────────────────────

  it('returns light palette when effective scheme is "light"', () => {
    mockUseThemeMode.mockReturnValue({ effectiveScheme: 'light', themeMode: 'light', setThemeMode: jest.fn() });
    const { result } = renderHook(() => useAppTheme());
    expect(result.current).toEqual(lightColors);
  });

  it('returns dark palette when effective scheme is "dark"', () => {
    mockUseThemeMode.mockReturnValue({ effectiveScheme: 'dark', themeMode: 'dark', setThemeMode: jest.fn() });
    const { result } = renderHook(() => useAppTheme());
    expect(result.current).toEqual(darkColors);
  });

  it('defaults to light palette when effective scheme is not "dark"', () => {
    mockUseThemeMode.mockReturnValue({ effectiveScheme: 'light', themeMode: 'system', setThemeMode: jest.fn() });
    const { result } = renderHook(() => useAppTheme());
    expect(result.current).toEqual(lightColors);
  });

  it('updates palette when effective scheme changes', () => {
    mockUseThemeMode.mockReturnValue({ effectiveScheme: 'light', themeMode: 'light', setThemeMode: jest.fn() });
    const { result, rerender } = renderHook(() => useAppTheme());
    expect(result.current).toEqual(lightColors);

    mockUseThemeMode.mockReturnValue({ effectiveScheme: 'dark', themeMode: 'dark', setThemeMode: jest.fn() });
    rerender({});
    expect(result.current).toEqual(darkColors);
  });

  // ─── Palette structure ────────────────────────────────────────────────────

  it('light and dark palettes have identical keys', () => {
    const lightKeys = Object.keys(lightColors).sort();
    const darkKeys = Object.keys(darkColors).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it('every palette key maps to a non-empty string value', () => {
    for (const [, value] of Object.entries(lightColors)) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
    for (const [, value] of Object.entries(darkColors)) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });

  // ─── Contrast assurances ──────────────────────────────────────────────────

  it('background colours differ between light and dark mode', () => {
    expect(lightColors.screenBackground).not.toBe(darkColors.screenBackground);
    expect(lightColors.cardBackground).not.toBe(darkColors.cardBackground);
    expect(lightColors.inputBackground).not.toBe(darkColors.inputBackground);
    expect(lightColors.statBoxBackground).not.toBe(darkColors.statBoxBackground);
  });

  it('text colours differ between light and dark mode', () => {
    expect(lightColors.textPrimary).not.toBe(darkColors.textPrimary);
    expect(lightColors.textSecondary).not.toBe(darkColors.textSecondary);
    expect(lightColors.textTertiary).not.toBe(darkColors.textTertiary);
  });

  it('light mode uses dark text on light backgrounds', () => {
    expect(lightColors.textPrimary).toBe('#1f2937');
    expect(lightColors.cardBackground).toBe('#ffffff');
  });

  it('dark mode uses light text on dark backgrounds', () => {
    expect(darkColors.textPrimary).toBe('#e5e7eb');
    expect(darkColors.cardBackground).toBe('#1c1f21');
  });

  it('error colours differ between themes to suit each background', () => {
    expect(lightColors.error).not.toBe(darkColors.error);
    expect(lightColors.errorBackground).not.toBe(darkColors.errorBackground);
  });

  // ─── Brand colour consistency ─────────────────────────────────────────────

  it('primary brand colour is #22c55e in both themes', () => {
    expect(lightColors.primary).toBe('#22c55e');
    expect(darkColors.primary).toBe('#22c55e');
  });
});
