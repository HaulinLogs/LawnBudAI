import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import ParallaxScrollView  from '@/components/ParallaxScrollView';
import { useWeather } from '../hooks/useWeather';
import { styles } from './HomeScreen.styles';
import { TodoStatusCard } from '@/components/TodoStatusCard';
import { useTodo } from '@/hooks/useTodo';
import { WeatherResponse } from '@/models/weather';

export default function HomeScreen() {
  const { weather, loading, error } = useWeather('Madison');
  const { mowingTodo, fertilizerTodo, wateringTodo } = useTodo('mowing');

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;

    function shouldRain(weather: WeatherResponse) {
        let shouldRain = false;
        weather.weather[0].hourly.forEach(hour => {
            
            });
        return shouldRain;
    }

  return (
    <>
      <Stack.Screen options={{ title: 'LawnBud AI' }} />
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#ecfdf5', dark: '#064e3b' }}
        headerImage={<></>}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Today’s Weather</Text>
            {loading ? (
              <ActivityIndicator color="#22c55e" style={styles.loadingIndicator} />
            ) : weather ? (
              <Text style={styles.weatherText}>
                {weather?.current_condition[0]?.weatherDesc[0]?.value} · {weather?.current_condition[0].temp_F}°F ·{' '}
                {shouldRain(weather) ? 'Chance of rain' : 'No rain expected'}
              </Text>
            ) : (
              <Text style={styles.errorText}>Weather unavailable</Text>
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
