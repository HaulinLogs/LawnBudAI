/**
 * UsdaZoneCard
 *
 * Displays the user's USDA hardiness zone and a pro-grade fertilizer
 * recommendation with specific NPK ratios, application rate, and
 * zone-calibrated timing — all in one card on the home screen.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { type UsdaZoneInfo, type NpkRecommendation } from '@/services/usdaZone';
import { type AppThemeColors } from '@/hooks/useAppTheme';

interface Props {
  city: string;
  state: string;
  zoneInfo: UsdaZoneInfo | null;
  fertilizerRecommendation: NpkRecommendation | null;
  lawnSizeSqFt?: number | null;
  colors: AppThemeColors;
}

// Urgency color helpers
function getTimingColor(rec: NpkRecommendation, colors: AppThemeColors): string {
  if (rec.seasonStatus === 'dormant') return colors.textTertiary;
  if (rec.daysUntilDue === null) return colors.textTertiary;
  if (rec.daysUntilDue <= 0) return colors.warning;   // due / overdue
  if (rec.daysUntilDue <= 7) return '#f59e0b';        // due within a week
  return colors.success;                               // plenty of time
}

function getTimingBadgeStyle(rec: NpkRecommendation, colors: AppThemeColors) {
  if (rec.seasonStatus === 'dormant') {
    return { backgroundColor: colors.statBoxBackground, borderColor: colors.border };
  }
  if (rec.daysUntilDue !== null && rec.daysUntilDue <= 0) {
    return { backgroundColor: '#fef3c7', borderColor: '#f59e0b' };
  }
  if (rec.daysUntilDue !== null && rec.daysUntilDue <= 7) {
    return { backgroundColor: '#fff7ed', borderColor: '#fb923c' };
  }
  return { backgroundColor: '#f0fdf4', borderColor: '#22c55e' };
}

export function UsdaZoneCard({ city, state, zoneInfo, fertilizerRecommendation, lawnSizeSqFt, colors }: Props) {
  const styles = createStyles(colors);

  if (!zoneInfo) {
    return (
      <View style={styles.card} testID="usda-zone-card">
        <Text style={styles.cardTitle}>Your Lawn Zone</Text>
        <Text style={styles.unknownText}>
          Zone data unavailable for {city}, {state}. Check your location in Settings.
        </Text>
      </View>
    );
  }

  const rec = fertilizerRecommendation;

  return (
    <View style={styles.card} testID="usda-zone-card">
      {/* ── Zone Header ── */}
      <View style={styles.zoneHeaderRow}>
        <View style={styles.zoneBadge}>
          <Text style={styles.zoneBadgeText}>{zoneInfo.label}</Text>
        </View>
        <View style={styles.zoneHeaderText}>
          <Text style={styles.cardTitle}>Your Lawn Zone</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {city}, {state}
          </Text>
        </View>
      </View>

      <Text style={styles.zoneDescription}>{zoneInfo.description}</Text>

      {/* ── Climate Details ── */}
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>First Frost</Text>
          <Text style={styles.detailValue}>{zoneInfo.typicalFirstFrost}</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Last Frost</Text>
          <Text style={styles.detailValue}>{zoneInfo.typicalLastFrost}</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Winter Low</Text>
          <Text style={styles.detailValue}>{zoneInfo.minTempRange}</Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={styles.sectionDivider} />

      {/* ── Fertilizer Recommendation ── */}
      <Text style={styles.fertSectionTitle}>Next Fertilizer Application</Text>

      {rec ? (
        <>
          {/* Timing badge */}
          <View style={[styles.timingBadge, getTimingBadgeStyle(rec, colors)]}>
            <Text style={[styles.timingText, { color: getTimingColor(rec, colors) }]}>
              {rec.timingLabel}
            </Text>
          </View>

          {rec.seasonStatus === 'dormant' ? (
            <View style={styles.dormantBox} testID="usda-zone-dormant">
              <Text style={styles.dormantTitle}>Not Recommended This Season</Text>
              <Text style={styles.dormantBody}>{rec.proTip}</Text>
            </View>
          ) : (
            <>
              {/* NPK + Rate row */}
              <View style={styles.npkRow}>
                <View style={styles.npkBox}>
                  <Text style={styles.npkLabel}>NPK Ratio</Text>
                  <Text style={styles.npkValue} testID="usda-zone-npk">{rec.npk}</Text>
                </View>
                <View style={styles.npkBox}>
                  <Text style={styles.npkLabel}>Rate / 1,000 sq ft</Text>
                  <Text style={styles.npkValue}>{rec.ratePerThousandSqFt} lbs</Text>
                </View>
                {rec.suggestedTotalLbs !== null && (
                  <View style={styles.npkBox}>
                    <Text style={styles.npkLabel}>Your Lawn Total</Text>
                    <Text style={styles.npkValue}>{rec.suggestedTotalLbs} lbs</Text>
                  </View>
                )}
              </View>

              {/* Product type */}
              <View style={styles.productRow}>
                <Text style={styles.productLabel}>Product: </Text>
                <Text style={styles.productValue}>{rec.productType}</Text>
              </View>

              {/* Lawn size note if size unknown */}
              {!lawnSizeSqFt && rec.seasonStatus === 'active' && (
                <Text style={styles.sizeTip}>
                  Set your lawn size in Settings to get a precise total amount.
                </Text>
              )}

              {/* Pro tip */}
              <View style={styles.proTipBox}>
                <Text style={styles.proTipLabel}>Pro Tip</Text>
                <Text style={styles.proTipText}>{rec.proTip}</Text>
              </View>
            </>
          )}
        </>
      ) : (
        <Text style={styles.unknownText}>
          Set your location in Settings to get fertilizer recommendations.
        </Text>
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
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    locationText: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 1,
    },
    unknownText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
    },

    // Zone header
    zoneHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    zoneBadge: {
      backgroundColor: '#14532d',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      minWidth: 80,
      alignItems: 'center',
    },
    zoneBadgeText: {
      color: '#86efac',
      fontWeight: '800',
      fontSize: 16,
      letterSpacing: 0.5,
    },
    zoneHeaderText: {
      flex: 1,
    },
    zoneDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 12,
      lineHeight: 18,
    },

    // Climate detail row
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.statBoxBackground,
      borderRadius: 8,
      padding: 10,
      marginBottom: 12,
    },
    detailItem: {
      flex: 1,
      alignItems: 'center',
    },
    detailDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    detailLabel: {
      fontSize: 10,
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    detailValue: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
    },

    // Section divider
    sectionDivider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginBottom: 12,
    },
    fertSectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 8,
    },

    // Timing badge
    timingBadge: {
      borderRadius: 6,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 5,
      alignSelf: 'flex-start',
      marginBottom: 12,
    },
    timingText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // Dormant state
    dormantBox: {
      backgroundColor: colors.statBoxBackground,
      borderRadius: 8,
      padding: 12,
    },
    dormantTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    dormantBody: {
      fontSize: 13,
      color: colors.textTertiary,
      lineHeight: 18,
    },

    // NPK row
    npkRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 10,
    },
    npkBox: {
      flex: 1,
      backgroundColor: colors.statBoxBackground,
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
    },
    npkLabel: {
      fontSize: 10,
      color: colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: 3,
      textAlign: 'center',
    },
    npkValue: {
      fontSize: 16,
      fontWeight: '800',
      color: '#15803d',
      textAlign: 'center',
    },

    // Product type
    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    productLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    productValue: {
      fontSize: 13,
      color: colors.textPrimary,
      flex: 1,
      flexWrap: 'wrap',
    },

    sizeTip: {
      fontSize: 12,
      color: colors.textTertiary,
      fontStyle: 'italic',
      marginBottom: 8,
    },

    // Pro tip
    proTipBox: {
      backgroundColor: '#f0fdf4',
      borderLeftWidth: 3,
      borderLeftColor: '#22c55e',
      borderRadius: 4,
      padding: 10,
    },
    proTipLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#15803d',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 3,
    },
    proTipText: {
      fontSize: 13,
      color: '#166534',
      lineHeight: 18,
    },
  });
}
