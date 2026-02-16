import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/Ionicons';
import { getCurrentWeatherIcon } from '@/models/weather';
import { useWeather } from '@/hooks/useWeather';
import { styles } from './Screen.styles';

export default function MowingScreen() { // Export the function
  const { weather, loading, error } = useWeather('Madison');
  const [weatherIcon, setWeatherIcon] = useState<React.ComponentProps<typeof Icon>['name']>('sunny-outline');

  useEffect(() => {
    if (weather) {
      setWeatherIcon(getCurrentWeatherIcon(weather));
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