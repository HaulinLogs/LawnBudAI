import { View, Text, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Stack } from 'expo-router';
import ParallaxScrollView  from '@/components/ParallaxScrollView';
import { useWeather } from '@/hooks/useWeather';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { createHomeStyles } from './HomeScreen.styles';
import { TodoStatusCard } from '@/components/TodoStatusCard';
import { useTodo } from '@/hooks/useTodo';
import React, { useEffect, useMemo } from 'react';
import { WeatherCard } from '@/components/WeatherCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { type GrassType } from '@/lib/lawnAdvice';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function HomeScreen() {
  const { prefs, loading: prefsLoading } = useUserPreferences();
  const { weather, loading, error } = useWeather(prefs.city, prefs.state);
  const { mowingTodo, fertilizerTodo, wateringTodo, overseedingReminder } = useTodo(prefs.grass_type as GrassType);
  const themeColors = useAppTheme();
  const styles = useMemo(() => createHomeStyles(themeColors), [themeColors]);

  // Log errors for owner notification (send to error tracking service)
  useEffect(() => {
    if (error) {
      console.error('[HOMESCREEN_ERROR]', {
        timestamp: new Date().toISOString(),
        error,
        city: prefs.city,
        state: prefs.state,
        url: 'app-homescreen',
      });
      // TODO: In production, send to error tracking service like Sentry, LogRocket, or custom webhook
      // Example: sendToErrorTracker({ error, context: 'homescreen', city: prefs.city, state: prefs.state });
    }
  }, [error, prefs.city, prefs.state]);

  if (loading || prefsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.screenBackgroundGreen }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.screenBackgroundGreen, paddingHorizontal: 20 }}>
        <View style={{ backgroundColor: themeColors.errorBackground, borderRadius: 12, padding: 24, borderLeftWidth: 4, borderLeftColor: themeColors.error, alignItems: 'center' }}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={themeColors.error} />
          <Text style={{ color: themeColors.errorText, fontSize: 18, fontWeight: 'bold', marginBottom: 8, marginTop: 16 }}>
            Weather Unavailable
          </Text>
          <Text style={{ color: themeColors.errorText, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>
            {error}
          </Text>
          <Text style={{ color: themeColors.textTertiary, fontSize: 12, marginTop: 12, textAlign: 'center' }}>
            Please try again shortly or check your internet connection.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'LawnBud AI' }} />
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#ecfdf5', dark: '#064e3b' }}
        headerImage={<Image source={require('@/assets/images/icon.png')} style={{ width: 100, height: 100 }}
        height={100}
      />}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            {loading ? (
                <ActivityIndicator color="#22c55e" style={styles.loadingIndicator} />
              ) : (
                weather ? (<WeatherCard weather={weather} />) : (<Text style={{ color: themeColors.textSecondary }}>Weather not available...</Text>)
              )}
          </View>
          <View style={styles.section}>
            <TodoStatusCard
              title="Mowing"
              todo={mowingTodo}
            />
            <TodoStatusCard
              title="Watering"
              todo={wateringTodo}
            />
            <TodoStatusCard
              title="Fertilizing"
              todo={fertilizerTodo}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
            {overseedingReminder ? (
              <View style={[
                styles.reminderItem,
                overseedingReminder.urgency === 'now'
                  ? { backgroundColor: '#fef3c7', borderLeftWidth: 4, borderLeftColor: '#f59e0b' }
                  : { backgroundColor: '#dbeafe', borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
              ]}>
                <Text style={[
                  styles.reminderTitle,
                  { color: overseedingReminder.urgency === 'now' ? '#92400e' : '#1e3a5f' },
                ]}>
                  {overseedingReminder.title}
                </Text>
                <Text style={[
                  styles.reminderSubtitle,
                  { color: overseedingReminder.urgency === 'now' ? '#78350f' : '#1e40af' },
                ]}>
                  {overseedingReminder.subtitle}
                </Text>
              </View>
            ) : (
              <View style={styles.reminderItem}>
                <Text style={styles.reminderTitle}>No reminders scheduled</Text>
                <Text style={styles.reminderSubtitle}>
                  Log a mowing, watering, or fertilizer event to track your lawn care schedule.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </ParallaxScrollView>
    </>
  );
}
