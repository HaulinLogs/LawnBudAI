/**
 * OverseedingCard
 *
 * Displays soil temperature, overseeding readiness, a quick-log seed button,
 * watering reminders after seeding, germination countdown, and links to
 * authoritative university extension resources.
 *
 * Shown on the home screen when soil temperature data is available or when
 * the user is in an overseeding window for their grass type.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import type { AppThemeColors } from '@/hooks/useAppTheme';
import type { SoilTempData } from '@/services/soilTemp';
import type { GrassType, OverseedingReminder } from '@/lib/lawnAdvice';
import type { GrassSeedType, SeedEvent } from '@/models/events';
import {
  evaluateSoilTempForOverseeding,
  getSeedingWateringReminder,
  GERMINATION_INFO,
  OVERSEEDING_ADVICE_LINKS,
} from '@/lib/lawnAdvice';

interface Props {
  grassType: GrassType;
  soilTempData: SoilTempData | null;
  soilTempLoading: boolean;
  soilTempError: string | null;
  overseedingReminder: OverseedingReminder | null;
  latestSeedEvent: SeedEvent | null;
  daysSinceLastSeed: number | null;
  onLogSeedEvent: () => void;
  seedEventLogging?: boolean;
  colors: AppThemeColors;
}

function grassTypeToSeedType(grassType: GrassType): GrassSeedType {
  if (grassType === 'cool_season') return 'mixed'; // default blend
  if (grassType === 'warm_season') return 'bermudagrass';
  return 'mixed';
}

function formatTempBadgeColor(
  status: 'ideal' | 'approaching' | 'too_warm' | 'too_cold' | 'unknown',
) {
  switch (status) {
    case 'ideal':
      return { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' };
    case 'approaching':
      return { bg: '#fff7ed', border: '#f97316', text: '#c2410c' };
    case 'too_warm':
      return { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' };
    case 'too_cold':
      return { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' };
    default:
      return { bg: '#f3f4f6', border: '#9ca3af', text: '#6b7280' };
  }
}

export function OverseedingCard({
  grassType,
  soilTempData,
  soilTempLoading,
  soilTempError,
  overseedingReminder,
  latestSeedEvent,
  daysSinceLastSeed,
  onLogSeedEvent,
  seedEventLogging = false,
  colors,
}: Props) {
  const [linksExpanded, setLinksExpanded] = useState(false);
  const styles = createStyles(colors);

  // Evaluate soil temp status
  const soilEval =
    soilTempData
      ? evaluateSoilTempForOverseeding(
          soilTempData.currentTempF,
          soilTempData.trendDegPerDay,
          grassType,
        )
      : null;

  // Post-seed watering reminder
  const seedType: GrassSeedType =
    latestSeedEvent?.grass_seed_type ?? grassTypeToSeedType(grassType);
  const wateringReminder =
    daysSinceLastSeed !== null
      ? getSeedingWateringReminder(daysSinceLastSeed, seedType)
      : null;

  // Germination info for the seeded grass type
  const germInfo = GERMINATION_INFO[seedType] ?? GERMINATION_INFO.unknown;
  const showGerminationInfo = daysSinceLastSeed !== null && daysSinceLastSeed <= 60;
  const germinationDayMin = germInfo.minDays;
  const germinationDayMax = germInfo.maxDays;

  const adviceLinks = OVERSEEDING_ADVICE_LINKS[grassType] ?? OVERSEEDING_ADVICE_LINKS.mixed;

  // Decide whether to show this card at all
  const hasRelevantContent =
    soilTempData !== null ||
    soilTempLoading ||
    soilTempError !== null ||
    overseedingReminder !== null ||
    wateringReminder !== null;

  if (!hasRelevantContent) return null;

  const tempColors = soilEval ? formatTempBadgeColor(soilEval.status) : formatTempBadgeColor('unknown');

  return (
    <View style={styles.card} testID="overseeding-card">
      {/* Header */}
      <Text style={styles.cardTitle}>Overseeding</Text>

      {/* ── Soil Temperature Section ── */}
      {soilTempLoading && (
        <View style={styles.loadingRow} testID="soil-temp-loading">
          <ActivityIndicator size="small" color="#22c55e" />
          <Text style={styles.loadingText}>Loading soil temperature…</Text>
        </View>
      )}

      {soilTempError && !soilTempLoading && (
        <View style={styles.errorBox} testID="soil-temp-error">
          <Text style={styles.errorText}>Soil temp unavailable — using calendar-based advice</Text>
        </View>
      )}

      {soilTempData && soilEval && (
        <View style={styles.soilTempSection} testID="soil-temp-section">
          <View style={[styles.tempBadge, { backgroundColor: tempColors.bg, borderColor: tempColors.border }]}>
            <Text style={[styles.tempBadgeTemp, { color: tempColors.text }]}>
              {soilTempData.currentTempF}°F
            </Text>
            <Text style={[styles.tempBadgeLabel, { color: tempColors.text }]}>Soil Temp</Text>
          </View>
          <View style={styles.soilTempDetails}>
            <Text style={styles.soilTempStatusText}>
              {soilEval.status === 'ideal' && '✓ Ideal for overseeding'}
              {soilEval.status === 'approaching' && soilEval.daysUntilOptimal
                ? `Optimal in ~${soilEval.daysUntilOptimal} day${soilEval.daysUntilOptimal === 1 ? '' : 's'}`
                : soilEval.status === 'approaching'
                  ? 'Trending toward optimal'
                  : ''}
              {soilEval.status === 'too_warm' && 'Too warm — wait for cooler soil'}
              {soilEval.status === 'too_cold' && 'Too cold — wait for warmer soil'}
            </Text>
            <Text style={styles.soilTempSubtext}>
              {grassType === 'warm_season'
                ? 'Optimal: 65–85°F for warm-season seed'
                : 'Optimal: 50–65°F for cool-season seed'}
            </Text>
            {soilTempData.trendDegPerDay !== 0 && (
              <Text style={styles.trendText}>
                {soilTempData.trendDegPerDay > 0
                  ? `↑ Warming ${Math.abs(soilTempData.trendDegPerDay)}°F/day`
                  : `↓ Cooling ${Math.abs(soilTempData.trendDegPerDay)}°F/day`}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* ── Calendar Reminder (month-based) ── */}
      {overseedingReminder && (
        <View
          style={[
            styles.reminderBox,
            overseedingReminder.urgency === 'now'
              ? { backgroundColor: '#fef3c7', borderLeftColor: '#f59e0b' }
              : { backgroundColor: '#dbeafe', borderLeftColor: '#3b82f6' },
          ]}
          testID="overseeding-reminder"
        >
          <Text
            style={[
              styles.reminderTitle,
              { color: overseedingReminder.urgency === 'now' ? '#92400e' : '#1e3a5f' },
            ]}
          >
            {overseedingReminder.title}
          </Text>
          <Text
            style={[
              styles.reminderText,
              { color: overseedingReminder.urgency === 'now' ? '#78350f' : '#1e40af' },
            ]}
          >
            {overseedingReminder.subtitle}
          </Text>
        </View>
      )}

      {/* ── "I seeded today" quick-log button ── */}
      {(overseedingReminder?.urgency === 'now' || soilEval?.status === 'ideal') && !wateringReminder && (
        <TouchableOpacity
          style={[styles.seedButton, seedEventLogging && styles.seedButtonDisabled]}
          onPress={onLogSeedEvent}
          disabled={seedEventLogging}
          testID="log-seed-button"
        >
          {seedEventLogging ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.seedButtonText}>🌱  I Seeded Today</Text>
          )}
        </TouchableOpacity>
      )}

      {/* ── Watering Reminders (post-seed) ── */}
      {wateringReminder && (
        <View
          style={[
            styles.wateringBox,
            wateringReminder.urgency === 'high'
              ? { backgroundColor: '#eff6ff', borderLeftColor: '#3b82f6' }
              : { backgroundColor: '#f0fdf4', borderLeftColor: '#22c55e' },
          ]}
          testID="watering-reminder"
        >
          <Text style={styles.wateringTitle}>
            {wateringReminder.urgency === 'high' ? '💧 Watering Required' : '💧 Keep Watering'}
          </Text>
          <Text style={styles.wateringText}>{wateringReminder.message}</Text>
        </View>
      )}

      {/* ── Germination Countdown ── */}
      {showGerminationInfo && daysSinceLastSeed !== null && (
        <View style={styles.germinationBox} testID="germination-info">
          <Text style={styles.germinationTitle}>🌿 Germination Timeline</Text>
          {daysSinceLastSeed < germinationDayMin ? (
            <Text style={styles.germinationText}>
              Expect first sprouts in {germinationDayMin - daysSinceLastSeed}–
              {germinationDayMax - daysSinceLastSeed} days ({germInfo.label}: {germinationDayMin}–
              {germinationDayMax} days total)
            </Text>
          ) : daysSinceLastSeed <= germinationDayMax ? (
            <Text style={styles.germinationText}>
              Germination window is open! Watch for first sprouts. Keep seedbed consistently moist.
            </Text>
          ) : (
            <Text style={styles.germinationText}>
              Seeds should have germinated. If coverage is thin, consider spot-seeding bare areas.
            </Text>
          )}
          <Text style={styles.germinationOptimalTemp}>
            {germInfo.label} germinates best at {germInfo.optimalSoilTempMin}–
            {germInfo.optimalSoilTempMax}°F soil temp
          </Text>
        </View>
      )}

      {/* ── Extension Advice Links ── */}
      <TouchableOpacity
        onPress={() => setLinksExpanded(e => !e)}
        style={styles.linksToggle}
        testID="advice-links-toggle"
      >
        <Text style={styles.linksToggleText}>
          {linksExpanded ? '▲ Hide' : '▼ Show'} Expert Overseeding Guides
        </Text>
      </TouchableOpacity>

      {linksExpanded && (
        <View style={styles.linksContainer} testID="advice-links">
          {adviceLinks.map(link => (
            <TouchableOpacity
              key={link.url}
              onPress={() =>
                Linking.openURL(link.url).catch(() =>
                  Alert.alert('Could not open link', link.url),
                )
              }
              style={styles.linkRow}
            >
              <Text style={styles.linkText}>{link.label} →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      gap: 12,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    // Loading / error
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    loadingText: {
      fontSize: 13,
      color: colors.textTertiary,
    },
    errorBox: {
      backgroundColor: colors.statBoxBackground,
      borderRadius: 6,
      padding: 8,
    },
    errorText: {
      fontSize: 12,
      color: colors.textTertiary,
      fontStyle: 'italic',
    },

    // Soil temp row
    soilTempSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    tempBadge: {
      borderRadius: 8,
      borderWidth: 1.5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      alignItems: 'center',
      minWidth: 70,
    },
    tempBadgeTemp: {
      fontSize: 20,
      fontWeight: '800',
    },
    tempBadgeLabel: {
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 1,
    },
    soilTempDetails: {
      flex: 1,
      gap: 2,
    },
    soilTempStatusText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    soilTempSubtext: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    trendText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },

    // Calendar reminder
    reminderBox: {
      borderLeftWidth: 4,
      borderRadius: 4,
      padding: 10,
      gap: 4,
    },
    reminderTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    reminderText: {
      fontSize: 13,
      lineHeight: 18,
    },

    // Seed button
    seedButton: {
      backgroundColor: '#15803d',
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    seedButtonDisabled: {
      opacity: 0.6,
    },
    seedButtonText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.3,
    },

    // Watering reminder
    wateringBox: {
      borderLeftWidth: 4,
      borderRadius: 4,
      padding: 10,
      gap: 4,
    },
    wateringTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    wateringText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },

    // Germination
    germinationBox: {
      backgroundColor: colors.statBoxBackground,
      borderRadius: 8,
      padding: 10,
      gap: 4,
    },
    germinationTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    germinationText: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    germinationOptimalTemp: {
      fontSize: 11,
      color: colors.textTertiary,
      fontStyle: 'italic',
      marginTop: 2,
    },

    // Links
    linksToggle: {
      paddingVertical: 4,
    },
    linksToggleText: {
      fontSize: 13,
      color: '#15803d',
      fontWeight: '600',
    },
    linksContainer: {
      gap: 8,
    },
    linkRow: {
      paddingVertical: 4,
    },
    linkText: {
      fontSize: 13,
      color: '#1d4ed8',
      textDecorationLine: 'underline',
    },
  });
}
