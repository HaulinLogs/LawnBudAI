/**
 * StoreTipCard — "What to buy at the store" card shown during overseeding season.
 *
 * Displayed only when getOverseedingReminder() returns non-null (i.e. the user
 * is in their overseeding window). Pulls store tip text and example product
 * names from the grass variety catalog so the advice is variety-specific.
 *
 * If the user has not selected a variety yet, it falls back to a generic
 * grass-type-level tip.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GRASS_VARIETIES } from '@/lib/grassVarieties';

interface StoreTipCardProps {
  /** The user's selected grass variety id (from user_preferences.grass_variety) */
  grassVariety?: string;
  /** The user's grass type — used when no variety is selected */
  grassType?: string;
}

const FALLBACK_TIPS: Record<string, { storeTip: string; products: string[] }> = {
  cool_season: {
    storeTip:
      'Look for bags labeled "Sun & Shade Mix" — most cool-season blends contain Tall Fescue, Kentucky Bluegrass, and Perennial Ryegrass.',
    products: [
      'Scotts Turf Builder Sun & Shade Mix',
      'Pennington Smart Seed Sun & Shade',
      'Jonathan Green Black Beauty Ultra',
    ],
  },
  warm_season: {
    storeTip:
      'For winter color, look for "Perennial Ryegrass" seed bags. Broadcast at 10–15 lbs/1,000 sq ft over your dormant warm-season lawn.',
    products: [
      'Scotts Turf Builder Perennial Ryegrass',
      'Pennington Smart Seed Perennial Ryegrass',
    ],
  },
  mixed: {
    storeTip:
      'Look for "Sun & Shade Mix" for cool-season areas, or "Perennial Ryegrass" for warm-season patches that need winter color.',
    products: [
      'Scotts Turf Builder Sun & Shade Mix',
      'Pennington Smart Seed Sun & Shade',
    ],
  },
};

export default function StoreTipCard({ grassVariety, grassType }: StoreTipCardProps) {
  const variety = grassVariety ? GRASS_VARIETIES.find((v) => v.id === grassVariety) : undefined;

  const displayName = variety?.displayName ?? null;
  const storeTip = variety?.storeTip ?? FALLBACK_TIPS[grassType ?? 'cool_season']?.storeTip ?? '';
  const products = variety?.exampleProducts ?? FALLBACK_TIPS[grassType ?? 'cool_season']?.products ?? [];

  if (!storeTip) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>🛒</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>What to Buy</Text>
          {displayName && (
            <Text style={styles.subtitle}>Based on your lawn: {displayName}</Text>
          )}
        </View>
      </View>

      <Text style={styles.tipText}>{storeTip}</Text>

      {products.length > 0 && (
        <>
          <Text style={styles.productsLabel}>Popular options:</Text>
          {products.map((product) => (
            <Text key={product} style={styles.productItem}>
              • {product}
            </Text>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#14532d',
  },
  subtitle: {
    fontSize: 13,
    color: '#166534',
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 12,
  },
  productsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  productItem: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 4,
  },
});
