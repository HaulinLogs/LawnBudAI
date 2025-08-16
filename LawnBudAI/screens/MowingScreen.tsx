import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/Ionicons';
import { getWeatherIcon } from '@/models/weather';
import { useWeather } from '@/hooks/useWeather';
export default function MowingScreen() { // Export the function
  const { weather, loading, error } = useWeather('Madison');
  const [weatherIcon, setWeatherIcon] = useState('');

  useEffect(() => {
    if (weather) {
      const weatherCode = weather.current_condition[0].weatherCode;
      setWeatherIcon(getWeatherIcon(weatherCode));
    }
  }, [weather]);

  const calculateRecommendedHeight = () => {
    // Stub function for calculating recommended height
    return 2.5;
  };

  const router = useRouter();
   return (
    <View style={styles.card}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#064e3b',
          },
          headerTitleStyle: {
            color: '#fff',
            fontSize: 24,
          },
          headerTitle: 'Mowing',
          headerLeft: () => (
            <TouchableOpacity onPress={() => {
               router.back();
            }}>
              <Icon name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Text style={styles.nextMowing}>Next Mowing</Text>
      <Text>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>

      <Text style={styles.sectionTitle}>Recommended Height</Text>
      <Text>Mow at {calculateRecommendedHeight()} inches</Text>

      <Text style={styles.sectionTitle}>Current Weather</Text>
      {/* Conditional rendering for loading, error, and weather data */}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.error}>Error: {error}</Text>}
      {weather && (
        <View style={styles.weatherContainer}>
          <Icon name={weatherIcon} size={48} color="#22c55e" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.weatherText}>
              {weather.current_condition[0].weatherDesc[0].value}
            </Text>
            <Text style={styles.temperature}>
              Temperature: {weather.current_condition[0].temp_F}°F
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  card: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold' },
  tip: { marginTop: 8, fontStyle: 'italic' },
  weatherContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: { fontSize: 16 },
  temperature: { fontSize: 14, color: 'gray' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  nextMowing: { fontSize: 16, marginTop: 10 },
  error: { color: 'red' },
});