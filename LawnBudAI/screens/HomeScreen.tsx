import { View, Text, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Stack } from 'expo-router';
import ParallaxScrollView  from '@/components/ParallaxScrollView';
import { useWeather } from '@/hooks/useWeather';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { styles } from './HomeScreen.styles';
import { TodoStatusCard } from '@/components/TodoStatusCard';
import { useTodo } from '@/hooks/useTodo';
import React, { useEffect } from 'react';
import { WeatherCard } from '@/components/WeatherCard';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function HomeScreen() {
  const { prefs, loading: prefsLoading } = useUserPreferences();
  const { weather, loading, error } = useWeather(prefs.city, prefs.state);
  const { mowingTodo, fertilizerTodo, wateringTodo } = useTodo('mowing');

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ecfdf5' }}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 20 }}>
        <View style={{ backgroundColor: '#fee2e2', borderRadius: 12, padding: 24, borderLeftWidth: 4, borderLeftColor: '#dc2626', alignItems: 'center' }}>
          <IconSymbol name="exclamationtriangle" size={48} color="#dc2626" />
          <Text style={{ color: '#7f1d1d', fontSize: 18, fontWeight: 'bold', marginBottom: 8, marginTop: 16 }}>
            Weather Unavailable
          </Text>
          <Text style={{ color: '#991b1b', fontSize: 14, lineHeight: 20, textAlign: 'center' }}>
            {error}
          </Text>
          <Text style={{ color: '#9a3412', fontSize: 12, marginTop: 12, textAlign: 'center' }}>
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
                weather ? (<WeatherCard weather={weather} />) : (<Text>Weather not available...</Text>)
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
            <View style={styles.reminderItem}>
              <Text style={styles.reminderTitle}>Mow Front Lawn</Text>
              <Text style={styles.reminderSubtitle}>Tomorrow · 10:00 AM</Text>
            </View>
            <View style={styles.reminderItem}>
              <Text style={styles.reminderTitle}>Water Backyard</Text>
              <Text style={styles.reminderSubtitle}>In 2 Days</Text>
            </View>
          </View>
        </ScrollView>
      </ParallaxScrollView>
    </>
  );
}
