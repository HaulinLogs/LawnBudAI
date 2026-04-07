import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LawnZone } from '@/models/zones';
import { AppThemeColors } from '@/hooks/useAppTheme';

interface ZoneStatusCardProps {
  zone: LawnZone;
  lastMowedDate: string | null;
  lastWateredDate: string | null;
  lastFertilizedDate: string | null;
  colors: AppThemeColors;
}

function formatDaysAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const today = new Date();
  const date = new Date(dateStr);
  const days = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export function ZoneStatusCard({
  zone,
  lastMowedDate,
  lastWateredDate,
  lastFertilizedDate,
  colors,
}: ZoneStatusCardProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.zoneName}>{zone.name}</Text>
        {zone.size_sqft != null && (
          <Text style={styles.zoneSize}>{zone.size_sqft.toLocaleString()} sq ft</Text>
        )}
      </View>

      <View style={styles.activityRow}>
        <ActivityPill label="Mowed" value={formatDaysAgo(lastMowedDate)} colors={colors} />
        <ActivityPill label="Watered" value={formatDaysAgo(lastWateredDate)} colors={colors} />
        <ActivityPill label="Fertilized" value={formatDaysAgo(lastFertilizedDate)} colors={colors} />
      </View>
    </View>
  );
}

interface ActivityPillProps {
  label: string;
  value: string;
  colors: AppThemeColors;
}

function ActivityPill({ label, value, colors }: ActivityPillProps) {
  const isNever = value === 'Never';
  const pillStyle = {
    backgroundColor: isNever ? colors.statBoxBackground : colors.highlightGreen,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center' as const,
    flex: 1,
    marginHorizontal: 3,
  };

  return (
    <View style={pillStyle}>
      <Text style={{ fontSize: 10, color: colors.textTertiary, marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: 12, fontWeight: '600', color: isNever ? colors.textTertiary : colors.subHeaderText }}>
        {value}
      </Text>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    zoneName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    zoneSize: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    activityRow: {
      flexDirection: 'row',
    },
  });
}
