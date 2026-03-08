/**
 * Tests for Statistics component
 *
 * Covers optional branches: title, icon, showBreakdown
 */

import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import Statistics from '@/components/Statistics';

jest.mock('@/contexts/ThemeContext', () => ({
  useThemeMode: jest.fn(() => ({ effectiveScheme: 'light', themeMode: 'light', setThemeMode: jest.fn() })),
}));

const STATS = [
  { value: '3', label: 'Days' },
  { value: '2.5"', label: 'Height' },
];

describe('Statistics', () => {
  it('renders stat values and labels', () => {
    render(<Statistics stats={STATS} />);
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('Days')).toBeTruthy();
    expect(screen.getByText('2.5"')).toBeTruthy();
    expect(screen.getByText('Height')).toBeTruthy();
  });

  it('renders title when provided', () => {
    render(<Statistics stats={STATS} title="My Stats" />);
    expect(screen.getByText('My Stats')).toBeTruthy();
  });

  it('renders without title (optional prop omitted)', () => {
    render(<Statistics stats={STATS} />);
    expect(screen.queryByTestId('statistics-title')).toBeNull();
  });

  it('renders stat with an icon', () => {
    const statsWithIcon = [
      { value: '5', label: 'Score', icon: <Text testID="icon">★</Text> },
    ];
    render(<Statistics stats={statsWithIcon} />);
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('renders stats without icons (icon prop omitted)', () => {
    render(<Statistics stats={STATS} />);
    expect(screen.getByText('Days')).toBeTruthy();
  });

  it('renders breakdown when provided', () => {
    render(<Statistics stats={STATS} showBreakdown={<Text testID="breakdown">Breakdown</Text>} />);
    expect(screen.getByTestId('breakdown')).toBeTruthy();
  });

  it('renders without breakdown (optional prop omitted)', () => {
    render(<Statistics stats={STATS} />);
    expect(screen.queryByTestId('breakdown')).toBeNull();
  });
});
