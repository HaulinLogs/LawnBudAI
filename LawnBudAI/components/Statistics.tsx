import React, { ReactNode, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { spacing, borderRadius } from '@/styles/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

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

function StatisticsComponent({
  stats,
  showBreakdown,
  title,
}: StatisticsProps) {
  const themeColors = useAppTheme();
  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    title: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: themeColors.textPrimary,
      marginBottom: spacing.md,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statBox: {
      flex: 1,
      backgroundColor: themeColors.statBoxBackground,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      marginHorizontal: 6,
      alignItems: 'center' as const,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: themeColors.primary,
      marginBottom: spacing.sm,
    },
    statLabel: {
      fontSize: 12,
      color: themeColors.textTertiary,
      textAlign: 'center' as const,
    },
    breakdown: {
      marginTop: spacing.lg,
    },
  }), [themeColors]);

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

export default React.memo(StatisticsComponent);
