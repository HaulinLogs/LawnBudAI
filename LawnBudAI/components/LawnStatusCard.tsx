import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = { weather: string | null, title: string | null };

export function LawnStatusCard({ weather, title }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text>{weather ?? 'Loading...'}</Text>
      <Text style={styles.tip}>
        {weather?.includes('Rain') ? 'No need to water today!' : 'Consider watering the lawn.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold' },
  tip: { marginTop: 8, fontStyle: 'italic' },
});