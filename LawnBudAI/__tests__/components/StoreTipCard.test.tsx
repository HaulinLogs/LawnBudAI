/**
 * Tests for components/StoreTipCard.tsx
 *
 * Covers all branch paths:
 * - Known grass variety → variety-specific tip and products
 * - Unknown variety id → falls back to grassType tip
 * - No variety, cool_season grassType → cool-season fallback
 * - No variety, warm_season grassType → warm-season fallback
 * - No variety, mixed grassType → mixed fallback
 * - No variety, undefined grassType → defaults to cool_season fallback
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StoreTipCard from '@/components/StoreTipCard';

describe('StoreTipCard', () => {
  describe('with a known grass variety', () => {
    it('renders "What to Buy" heading for tall_fescue', () => {
      render(<StoreTipCard grassVariety="tall_fescue" grassType="cool_season" />);
      expect(screen.getByText('What to Buy')).toBeTruthy();
    });

    it('renders variety display name in "Based on your lawn" subtitle', () => {
      render(<StoreTipCard grassVariety="tall_fescue" grassType="cool_season" />);
      expect(screen.getByText('Based on your lawn: Tall Fescue')).toBeTruthy();
    });

    it('renders "Popular options:" label for tall_fescue', () => {
      render(<StoreTipCard grassVariety="tall_fescue" grassType="cool_season" />);
      expect(screen.getByText('Popular options:')).toBeTruthy();
    });

    it('renders "Based on your lawn: Bermudagrass" subtitle for bermudagrass', () => {
      render(<StoreTipCard grassVariety="bermudagrass" grassType="warm_season" />);
      expect(screen.getByText('Based on your lawn: Bermudagrass')).toBeTruthy();
    });

    it('renders "Based on your lawn: Kentucky Bluegrass" for kentucky_bluegrass', () => {
      render(<StoreTipCard grassVariety="kentucky_bluegrass" grassType="cool_season" />);
      expect(screen.getByText('Based on your lawn: Kentucky Bluegrass')).toBeTruthy();
    });

    it('renders "Based on your lawn: Creeping Red Fescue" for creeping_red_fescue', () => {
      render(<StoreTipCard grassVariety="creeping_red_fescue" grassType="cool_season" />);
      expect(screen.getByText('Based on your lawn: Creeping Red Fescue')).toBeTruthy();
    });

    it('renders "Based on your lawn: Zoysia Grass" for zoysiagrass', () => {
      render(<StoreTipCard grassVariety="zoysiagrass" grassType="warm_season" />);
      expect(screen.getByText('Based on your lawn: Zoysia Grass')).toBeTruthy();
    });

    it('renders "Based on your lawn: St. Augustine Grass" for st_augustine', () => {
      render(<StoreTipCard grassVariety="st_augustine" grassType="warm_season" />);
      expect(screen.getByText('Based on your lawn: St. Augustine Grass')).toBeTruthy();
    });
  });

  describe('with an unknown variety id', () => {
    it('falls back to grassType tip and does not render "Based on your lawn" subtitle', () => {
      render(<StoreTipCard grassVariety="unknown_grass_id" grassType="cool_season" />);
      expect(screen.queryByText(/Based on your lawn/)).toBeNull();
      expect(screen.getByText('What to Buy')).toBeTruthy();
    });
  });

  describe('without a grass variety (grassType fallback)', () => {
    it('renders cool_season fallback and no subtitle', () => {
      render(<StoreTipCard grassType="cool_season" />);
      expect(screen.getByText('What to Buy')).toBeTruthy();
      expect(screen.queryByText(/Based on your lawn/)).toBeNull();
    });

    it('renders warm_season fallback', () => {
      render(<StoreTipCard grassType="warm_season" />);
      expect(screen.getByText('What to Buy')).toBeTruthy();
      expect(screen.queryByText(/Based on your lawn/)).toBeNull();
    });

    it('renders mixed fallback', () => {
      render(<StoreTipCard grassType="mixed" />);
      expect(screen.getByText('What to Buy')).toBeTruthy();
      expect(screen.queryByText(/Based on your lawn/)).toBeNull();
    });

    it('defaults to cool_season when no props provided', () => {
      render(<StoreTipCard />);
      expect(screen.getByText('What to Buy')).toBeTruthy();
      expect(screen.queryByText(/Based on your lawn/)).toBeNull();
    });
  });

  describe('card structure', () => {
    it('renders "Popular options:" when products exist for a variety', () => {
      render(<StoreTipCard grassVariety="bermudagrass" grassType="warm_season" />);
      expect(screen.getByText('Popular options:')).toBeTruthy();
    });

    it('renders "Popular options:" for fallback products', () => {
      render(<StoreTipCard grassType="cool_season" />);
      expect(screen.getByText('Popular options:')).toBeTruthy();
    });
  });
});
