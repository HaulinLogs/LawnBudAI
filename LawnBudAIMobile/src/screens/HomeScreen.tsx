import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getWeather } from '../services/WeatherService';
import LawnStatusCard from '../components/LawnStatusCard';

export default function HomeScreen() {
  const [weather, setWeather] = useState<string | null>(null);

  useEffect(() => {
    getWeather('Chicago').then(setWeather);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌿 LawnMate</Text>
      <LawnStatusCard weather={weather} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#eef' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
});