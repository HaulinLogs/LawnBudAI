import { View, Text, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Stack } from 'expo-router';
import ParallaxScrollView  from '@/components/ParallaxScrollView';
import { useWeather } from '@/hooks/useWeather';
import { styles } from './HomeScreen.styles';
import { TodoStatusCard } from '@/components/TodoStatusCard';
import { useTodo } from '@/hooks/useTodo';
import React from 'react';
import { WeatherCard } from '@/components/WeatherCard';

export default function HomeScreen() {
  const { weather, loading, error } = useWeather('Madison');
  const { mowingTodo, fertilizerTodo, wateringTodo } = useTodo('mowing');

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;

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
