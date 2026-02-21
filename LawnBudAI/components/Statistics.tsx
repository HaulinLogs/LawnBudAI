import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/styles/theme';

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
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginHorizontal: 6,
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center' as const,
  },
  breakdown: {
    marginTop: spacing.lg,
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
