/**
 * Tests for UsdaZoneCard component
 *
 * Covers: no-zone fallback, zone header rendering, dormant season,
 * active season NPK display, lawn-size tip, and no-recommendation fallback.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { UsdaZoneCard } from '@/components/UsdaZoneCard';
import { lightColors } from '@/hooks/useAppTheme';
import { type UsdaZoneInfo, type NpkRecommendation } from '@/services/usdaZone';

const BASE_ZONE_INFO: UsdaZoneInfo = {
  zone: 5,
  subzone: 'a',
  label: 'Zone 5a',
  description: 'Cold winters with average minimum temperatures between -20°F and -15°F.',
  minTempRange: '-20°F to -15°F',
  typicalFirstFrost: 'Oct 1–15',
  typicalLastFrost: 'Apr 16–30',
  climateCategory: 'cold',
  recommendedGrassType: 'cool_season',
};

const ACTIVE_REC: NpkRecommendation = {
  npk: '29-0-4',
  productType: 'Slow-release nitrogen granular',
  ratePerThousandSqFt: 4,
  suggestedTotalLbs: 20,
  timingLabel: 'Apply in 14 days',
  daysUntilDue: 14,
  seasonStatus: 'active',
  proTip: 'Water lightly after application.',
};

const DORMANT_REC: NpkRecommendation = {
  npk: '0-0-0',
  productType: 'None',
  ratePerThousandSqFt: 0,
  suggestedTotalLbs: null,
  timingLabel: 'Not recommended',
  daysUntilDue: null,
  seasonStatus: 'dormant',
  proTip: 'Avoid fertilizing dormant grass.',
};

describe('UsdaZoneCard', () => {
  describe('when zoneInfo is null', () => {
    it('renders fallback with city and state', () => {
      render(
        <UsdaZoneCard
          city="Nowhere"
          state="ZZ"
          zoneInfo={null}
          fertilizerRecommendation={null}
          colors={lightColors}
        />,
      );
      expect(screen.getByText('Your Lawn Zone')).toBeTruthy();
      expect(screen.getByText(/Zone data unavailable/)).toBeTruthy();
      expect(screen.getByText(/Nowhere, ZZ/)).toBeTruthy();
    });

    it('shows the usda-zone-card testID', () => {
      render(
        <UsdaZoneCard
          city="X"
          state="ZZ"
          zoneInfo={null}
          fertilizerRecommendation={null}
          colors={lightColors}
        />,
      );
      expect(screen.getByTestId('usda-zone-card')).toBeTruthy();
    });
  });

  describe('when zoneInfo is provided', () => {
    it('renders the zone label badge', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={ACTIVE_REC}
          colors={lightColors}
        />,
      );
      expect(screen.getByText('Zone 5a')).toBeTruthy();
    });

    it('renders city and state', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={ACTIVE_REC}
          colors={lightColors}
        />,
      );
      expect(screen.getByText('Madison, WI')).toBeTruthy();
    });

    it('renders climate detail labels', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={ACTIVE_REC}
          colors={lightColors}
        />,
      );
      expect(screen.getByText('First Frost')).toBeTruthy();
      expect(screen.getByText('Last Frost')).toBeTruthy();
      expect(screen.getByText('Winter Low')).toBeTruthy();
    });

    it('renders frost dates from zoneInfo', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={ACTIVE_REC}
          colors={lightColors}
        />,
      );
      expect(screen.getByText('Oct 1–15')).toBeTruthy();
      expect(screen.getByText('Apr 16–30')).toBeTruthy();
    });
  });

  describe('active recommendation', () => {
    it('renders NPK ratio', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={ACTIVE_REC}
          colors={lightColors}
        />,
      );
      expect(screen.getByTestId('usda-zone-npk')).toBeTruthy();
      expect(screen.getByText('29-0-4')).toBeTruthy();
    });

    it('renders the timing label', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={ACTIVE_REC}
          colors={lightColors}
        />,
      );
      expect(screen.getByText('Apply in 14 days')).toBeTruthy();
    });

    it('renders the pro tip', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={ACTIVE_REC}
          colors={lightColors}
        />,
      );
      expect(screen.getByText('Water lightly after application.')).toBeTruthy();
    });

    it('renders the total lbs when suggestedTotalLbs is provided', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={ACTIVE_REC}
          colors={lightColors}
        />,
      );
      expect(screen.getByText('20 lbs')).toBeTruthy();
    });

    it('shows lawn size tip when lawnSizeSqFt is not provided', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={{ ...ACTIVE_REC, suggestedTotalLbs: null }}
          colors={lightColors}
        />,
      );
      expect(screen.getByText(/Set your lawn size in Settings/)).toBeTruthy();
    });

    it('does not show lawn size tip when lawnSizeSqFt is provided', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={ACTIVE_REC}
          lawnSizeSqFt={5000}
          colors={lightColors}
        />,
      );
      expect(screen.queryByText(/Set your lawn size in Settings/)).toBeNull();
    });
  });

  describe('dormant recommendation', () => {
    it('renders dormant box', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={DORMANT_REC}
          colors={lightColors}
        />,
      );
      expect(screen.getByTestId('usda-zone-dormant')).toBeTruthy();
      expect(screen.getByText('Not Recommended This Season')).toBeTruthy();
    });

    it('renders the dormant pro tip', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={DORMANT_REC}
          colors={lightColors}
        />,
      );
      expect(screen.getByText('Avoid fertilizing dormant grass.')).toBeTruthy();
    });
  });

  describe('when fertilizerRecommendation is null', () => {
    it('renders set-location prompt', () => {
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={null}
          colors={lightColors}
        />,
      );
      expect(screen.getByText(/Set your location in Settings/)).toBeTruthy();
    });
  });

  describe('overdue timing color', () => {
    it('renders overdue timing label when daysUntilDue <= 0', () => {
      const overdueRec: NpkRecommendation = { ...ACTIVE_REC, daysUntilDue: 0, timingLabel: 'Overdue' };
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={overdueRec}
          colors={lightColors}
        />,
      );
      expect(screen.getByText('Overdue')).toBeTruthy();
    });

    it('renders due-soon timing label when daysUntilDue <= 7', () => {
      const soonRec: NpkRecommendation = { ...ACTIVE_REC, daysUntilDue: 5, timingLabel: 'Due Soon' };
      render(
        <UsdaZoneCard
          city="Madison"
          state="WI"
          zoneInfo={BASE_ZONE_INFO}
          fertilizerRecommendation={soonRec}
          colors={lightColors}
        />,
      );
      expect(screen.getByText('Due Soon')).toBeTruthy();
    });
  });
});
