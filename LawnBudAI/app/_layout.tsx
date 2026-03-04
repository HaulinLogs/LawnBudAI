import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAuth } from '@/hooks/useAuth';
import { ThemeContextProvider, useThemeMode } from '@/contexts/ThemeContext';

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 20,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  errorDetails: {
    color: '#7f1d1d',
    fontSize: 14,
    textAlign: 'center',
  },
});

function AppShell() {
  const { effectiveScheme } = useThemeMode();
  const { session, loading, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!session && !error) {
        router.replace('/(auth)/sign-in');
      }
    }
  }, [session, loading, error, router]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Application Error</Text>
        <Text style={styles.errorDetails}>{error}</Text>
        <Text style={styles.errorDetails}>Check your browser console (F12) for more details.</Text>
      </View>
    );
  }

  if (loading) {
    return null;
  }

  return (
    <ThemeProvider value={effectiveScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContextProvider>
      <AppShell />
    </ThemeContextProvider>
  );
}
