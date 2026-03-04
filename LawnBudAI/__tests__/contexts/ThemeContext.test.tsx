/**
 * Tests for ThemeContext
 *
 * Verifies that:
 * - The context defaults to 'system' mode
 * - Stored preferences are loaded from AsyncStorage on mount
 * - setThemeMode updates the in-memory state and persists to AsyncStorage
 * - effectiveScheme follows the system setting when themeMode is 'system'
 * - effectiveScheme is locked to 'light' or 'dark' when explicitly set
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContextProvider, useThemeMode } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = useColorScheme as jest.Mock;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeContextProvider>{children}</ThemeContextProvider>
);

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  // ─── Initial state ────────────────────────────────────────────────────────

  it('defaults to themeMode "system" when no value is stored', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    const { result } = renderHook(() => useThemeMode(), { wrapper });

    await waitFor(() => {
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@lawnbud_theme_mode');
    });

    expect(result.current.themeMode).toBe('system');
  });

  it('effectiveScheme follows system scheme when themeMode is "system" and system is light', async () => {
    mockUseColorScheme.mockReturnValue('light');
    const { result } = renderHook(() => useThemeMode(), { wrapper });

    await waitFor(() => expect(mockAsyncStorage.getItem).toHaveBeenCalled());

    expect(result.current.effectiveScheme).toBe('light');
  });

  it('effectiveScheme follows system scheme when themeMode is "system" and system is dark', async () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() => useThemeMode(), { wrapper });

    await waitFor(() => expect(mockAsyncStorage.getItem).toHaveBeenCalled());

    expect(result.current.effectiveScheme).toBe('dark');
  });

  // ─── Persisted preference loading ─────────────────────────────────────────

  it('loads "light" themeMode from AsyncStorage on mount', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('light');
    const { result } = renderHook(() => useThemeMode(), { wrapper });

    await waitFor(() => expect(result.current.themeMode).toBe('light'));

    expect(result.current.effectiveScheme).toBe('light');
  });

  it('loads "dark" themeMode from AsyncStorage on mount', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('dark');
    const { result } = renderHook(() => useThemeMode(), { wrapper });

    await waitFor(() => expect(result.current.themeMode).toBe('dark'));

    expect(result.current.effectiveScheme).toBe('dark');
  });

  it('loads "system" themeMode from AsyncStorage on mount', async () => {
    mockUseColorScheme.mockReturnValue('dark');
    mockAsyncStorage.getItem.mockResolvedValue('system');
    const { result } = renderHook(() => useThemeMode(), { wrapper });

    await waitFor(() => expect(result.current.themeMode).toBe('system'));

    // effectiveScheme should follow the system (dark) when themeMode is 'system'
    expect(result.current.effectiveScheme).toBe('dark');
  });

  it('ignores unrecognised values from AsyncStorage', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('invalid-value');
    const { result } = renderHook(() => useThemeMode(), { wrapper });

    await waitFor(() => expect(mockAsyncStorage.getItem).toHaveBeenCalled());

    expect(result.current.themeMode).toBe('system');
  });

  // ─── setThemeMode ─────────────────────────────────────────────────────────

  it('setThemeMode("light") sets themeMode and effectiveScheme to light', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useThemeMode(), { wrapper });
    await waitFor(() => expect(mockAsyncStorage.getItem).toHaveBeenCalled());

    await act(async () => {
      await result.current.setThemeMode('light');
    });

    expect(result.current.themeMode).toBe('light');
    expect(result.current.effectiveScheme).toBe('light');
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@lawnbud_theme_mode', 'light');
  });

  it('setThemeMode("dark") sets themeMode and effectiveScheme to dark', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useThemeMode(), { wrapper });
    await waitFor(() => expect(mockAsyncStorage.getItem).toHaveBeenCalled());

    await act(async () => {
      await result.current.setThemeMode('dark');
    });

    expect(result.current.themeMode).toBe('dark');
    expect(result.current.effectiveScheme).toBe('dark');
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@lawnbud_theme_mode', 'dark');
  });

  it('setThemeMode("system") makes effectiveScheme follow system scheme', async () => {
    mockUseColorScheme.mockReturnValue('dark');
    mockAsyncStorage.getItem.mockResolvedValue('light');
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useThemeMode(), { wrapper });
    await waitFor(() => expect(result.current.themeMode).toBe('light'));

    await act(async () => {
      await result.current.setThemeMode('system');
    });

    expect(result.current.themeMode).toBe('system');
    // System is dark, so effectiveScheme should now be dark
    expect(result.current.effectiveScheme).toBe('dark');
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@lawnbud_theme_mode', 'system');
  });

  it('explicit light mode overrides a dark system scheme', async () => {
    mockUseColorScheme.mockReturnValue('dark');
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useThemeMode(), { wrapper });
    await waitFor(() => expect(mockAsyncStorage.getItem).toHaveBeenCalled());

    await act(async () => {
      await result.current.setThemeMode('light');
    });

    expect(result.current.effectiveScheme).toBe('light');
  });

  it('explicit dark mode overrides a light system scheme', async () => {
    mockUseColorScheme.mockReturnValue('light');
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    const { result } = renderHook(() => useThemeMode(), { wrapper });
    await waitFor(() => expect(mockAsyncStorage.getItem).toHaveBeenCalled());

    await act(async () => {
      await result.current.setThemeMode('dark');
    });

    expect(result.current.effectiveScheme).toBe('dark');
  });
});
