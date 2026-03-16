import { View, Text, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { LawnStripeBackground } from '@/components/LawnStripeBackground';
import { useWeather } from '@/hooks/useWeather';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { createHomeStyles } from './HomeScreen.styles';
import { TodoStatusCard } from '@/components/TodoStatusCard';
import { useTodo } from '@/hooks/useTodo';
import React, { useEffect, useMemo, useState } from 'react';
import { WeatherCard } from '@/components/WeatherCard';
import { UsdaZoneCard } from '@/components/UsdaZoneCard';
import { OverseedingCard } from '@/components/OverseedingCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { type GrassType } from '@/lib/lawnAdvice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useUsdaZone } from '@/hooks/useUsdaZone';
import { useFertilizerEvents } from '@/hooks/useFertilizerEvents';
import { useSoilTemp } from '@/hooks/useSoilTemp';
import { useSeedEvents } from '@/hooks/useSeedEvents';

export default function HomeScreen() {
  const { prefs, loading: prefsLoading } = useUserPreferences();
  const { weather, loading: weatherLoading, error } = useWeather(prefs.city, prefs.state);
  const {
    mowingTodo,
    fertilizerTodo,
    wateringTodo,
    overseedingReminder,
    loading: todosLoading,
  } = useTodo(prefs.grass_type as GrassType);
  const themeColors = useAppTheme();
  const styles = useMemo(() => createHomeStyles(themeColors), [themeColors]);

  // Fertilizer history for zone-aware NPK recommendation
  const { events: fertilizerEvents } = useFertilizerEvents();
  const lastFertilizerDate = fertilizerEvents.length > 0 ? fertilizerEvents[0].date : undefined;

  // USDA zone + zone-calibrated fertilizer recommendation
  const { zoneInfo, fertilizerRecommendation } = useUsdaZone(
    prefs.city,
    prefs.state,
    lastFertilizerDate,
    prefs.lawn_size_sqft,
  );

  // Soil temperature (Open-Meteo)
  const {
    data: soilTempData,
    loading: soilTempLoading,
    error: soilTempError,
  } = useSoilTemp(prefs.city, prefs.state);

  // Seed events (for watering reminders + germination countdown)
  const {
    latestEvent: latestSeedEvent,
    daysSinceLastSeed,
    addEvent: addSeedEvent,
    loading: seedEventsLoading,
  } = useSeedEvents();

  const [seedEventLogging, setSeedEventLogging] = useState(false);

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

  const isWeatherLoading = weatherLoading || prefsLoading;
  const areTodosLoading = prefsLoading || todosLoading;

  async function handleLogSeedEvent() {
    setSeedEventLogging(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await addSeedEvent({
        date: today,
        grass_seed_type: 'mixed',
        notes: 'Logged from home screen',
      });
      Alert.alert(
        'Seeding Logged! 🌱',
        'Great! Water lightly 2–3× per day to keep the seedbed moist. Check back for germination updates.',
        [{ text: 'Got it' }],
      );
    } catch (err) {
      Alert.alert('Error', 'Could not log seeding event. Please try again.');
      console.error('[HomeScreen] addSeedEvent error:', err);
    } finally {
      setSeedEventLogging(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#4ade80', dark: '#14532d' }}
        headerImage={<LawnStripeBackground />}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Weather Section */}
          <View style={styles.card}>
            {isWeatherLoading ? (
              <View style={[styles.skeletonRow, { flexDirection: 'row', gap: 8 }]} testID="weather-loading">
                <ActivityIndicator size="small" color="#22c55e" />
                <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>
                  Loading weather for {prefs.city}...
                </Text>
              </View>
            ) : error ? (
              <View testID="weather-error">
                <IconSymbol name="exclamationmark.triangle" size={24} color={themeColors.error} />
                <Text style={[styles.errorText, { marginTop: 8, fontWeight: '600' }]}>
                  Weather Unavailable
                </Text>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={{ color: themeColors.textTertiary, fontSize: 12, marginTop: 4 }}>
                  Please try again shortly or check your internet connection.
                </Text>
              </View>
            ) : weather ? (
              <WeatherCard weather={weather} />
            ) : (
              <Text style={{ color: themeColors.textSecondary }}>Weather not available...</Text>
            )}
          </View>

          {/* Todo Status Section */}
          <View style={styles.section} testID="todo-section">
            {areTodosLoading ? (
              <>
                <View style={[styles.card, styles.skeletonRow]} testID="todos-loading">
                  <ActivityIndicator size="small" color="#22c55e" />
                </View>
                <View style={[styles.card, styles.skeletonRow]}>
                  <ActivityIndicator size="small" color="#22c55e" />
                </View>
                <View style={[styles.card, styles.skeletonRow]}>
                  <ActivityIndicator size="small" color="#22c55e" />
                </View>
              </>
            ) : (
              <>
                <TodoStatusCard title="Mowing" todo={mowingTodo} />
                <TodoStatusCard title="Watering" todo={wateringTodo} />
                <TodoStatusCard title="Fertilizing" todo={fertilizerTodo} />
              </>
            )}
          </View>

          {/* Overseeding Card (soil temp + seed event tracking) */}
          {!prefsLoading && !seedEventsLoading && (
            <OverseedingCard
              grassType={prefs.grass_type as GrassType}
              soilTempData={soilTempData}
              soilTempLoading={soilTempLoading}
              soilTempError={soilTempError}
              overseedingReminder={overseedingReminder}
              latestSeedEvent={latestSeedEvent}
              daysSinceLastSeed={daysSinceLastSeed}
              onLogSeedEvent={handleLogSeedEvent}
              seedEventLogging={seedEventLogging}
              colors={themeColors}
            />
          )}

          {/* USDA Zone + Fertilizer Recommendation Section */}
          {!prefsLoading && (
            <UsdaZoneCard
              city={prefs.city}
              state={prefs.state}
              zoneInfo={zoneInfo}
              fertilizerRecommendation={fertilizerRecommendation}
              lawnSizeSqFt={prefs.lawn_size_sqft}
              colors={themeColors}
            />
          )}

          {/* Upcoming Reminders Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
            {areTodosLoading ? (
              <View style={styles.skeletonRow} testID="reminders-loading">
                <ActivityIndicator size="small" color="#22c55e" />
              </View>
            ) : overseedingReminder ? (
              <View
                style={[
                  styles.reminderItem,
                  overseedingReminder.urgency === 'now'
                    ? { backgroundColor: '#fef3c7', borderLeftWidth: 4, borderLeftColor: '#f59e0b' }
                    : { backgroundColor: '#dbeafe', borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
                ]}
              >
                <Text
                  style={[
                    styles.reminderTitle,
                    { color: overseedingReminder.urgency === 'now' ? '#92400e' : '#1e3a5f' },
                  ]}
                >
                  {overseedingReminder.title}
                </Text>
                <Text
                  style={[
                    styles.reminderSubtitle,
                    { color: overseedingReminder.urgency === 'now' ? '#78350f' : '#1e40af' },
                  ]}
                >
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
