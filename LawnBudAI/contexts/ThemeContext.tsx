import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = '@lawnbud_theme_mode';

interface ThemeContextValue {
  themeMode: ThemeMode;
  effectiveScheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'system',
  effectiveScheme: 'light',
  setThemeMode: async () => {},
});

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme() ?? 'light';
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeModeState(stored);
      }
    });
  }, []);

  const effectiveScheme: 'light' | 'dark' =
    themeMode === 'system' ? systemScheme : themeMode;

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, effectiveScheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  return useContext(ThemeContext);
}
