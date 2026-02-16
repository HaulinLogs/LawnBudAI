import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface StatBox {
  value: string | number;
  label: string;
  icon?: ReactNode;
}

interface StatisticsProps {
  stats: StatBox[];
  showBreakdown?: ReactNode;
  title?: string;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  breakdown: {
    marginTop: 16,
  },
});

export default function Statistics({
  stats,
  showBreakdown,
  title,
}: StatisticsProps) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statBox}>
            {stat.icon && <View style={{ marginBottom: 4 }}>{stat.icon}</View>}
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {showBreakdown && <View style={styles.breakdown}>{showBreakdown}</View>}
    </View>
  );
}
