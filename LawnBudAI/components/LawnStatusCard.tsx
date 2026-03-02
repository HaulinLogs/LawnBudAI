import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = { weather: string | null, title: string | null };

export function LawnStatusCard({ weather, title }: Props) {
  const themeColors = useAppTheme();
  const styles = useMemo(() => StyleSheet.create({
    card: { padding: 16, backgroundColor: themeColors.cardBackground, borderRadius: 8, elevation: 2 },
    title: { fontSize: 20, fontWeight: 'bold', color: themeColors.textPrimary },
    body: { color: themeColors.textSecondary },
    tip: { marginTop: 8, fontStyle: 'italic', color: themeColors.textTertiary },
  }), [themeColors]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{weather ?? 'Loading...'}</Text>
      <Text style={styles.tip}>
        {weather?.includes('Rain') ? 'No need to water today!' : 'Consider watering the lawn.'}
      </Text>
    </View>
  );
}