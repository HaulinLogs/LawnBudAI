/**
 * Tests for the useThemeColor hook
 */

import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

const mockUseColorScheme = jest.fn(() => 'light' as string | null | undefined);

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

describe('useThemeColor', () => {
  it('returns the prop color when lightColor is provided and theme is light', () => {
    const { result } = renderHook(() =>
      useThemeColor({ light: '#custom-light', dark: '#custom-dark' }, 'text'),
    );
    expect(result.current).toBe('#custom-light');
  });

  it('returns Colors value when no prop color is provided', () => {
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    // Should return the default Colors.light.text value (a non-empty string)
    expect(typeof result.current).toBe('string');
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('falls back to "light" theme when useColorScheme returns null', () => {
    mockUseColorScheme.mockReturnValueOnce(null);
    const { result } = renderHook(() =>
      useThemeColor({ light: '#fallback' }, 'text'),
    );
    // With null colorScheme, theme defaults to 'light', so lightColor prop is used
    expect(result.current).toBe('#fallback');
  });
});
