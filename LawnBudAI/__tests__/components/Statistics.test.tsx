/**
 * Tests for the Statistics component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import Statistics from '@/components/Statistics';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

const baseStats = [
  { value: '42', label: 'Days' },
  { value: '3.5"', label: 'Height' },
];

describe('Statistics', () => {
  it('renders stat values and labels', () => {
    render(<Statistics stats={baseStats} />);
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('Days')).toBeTruthy();
  });

  it('renders title when provided', () => {
    render(<Statistics stats={baseStats} title="My Stats" />);
    expect(screen.getByText('My Stats')).toBeTruthy();
  });

  it('renders without title (falsy branch)', () => {
    const { queryByText } = render(<Statistics stats={baseStats} />);
    expect(queryByText('My Stats')).toBeNull();
  });

  it('renders showBreakdown when provided', () => {
    render(
      <Statistics stats={baseStats} showBreakdown={<Text testID="breakdown">Breakdown</Text>} />,
    );
    expect(screen.getByTestId('breakdown')).toBeTruthy();
  });

  it('renders without showBreakdown (falsy branch)', () => {
    const { queryByTestId } = render(<Statistics stats={baseStats} />);
    expect(queryByTestId('breakdown')).toBeNull();
  });

  it('renders stat with icon', () => {
    const statsWithIcon = [{ value: '5', label: 'Count', icon: <Text testID="stat-icon">★</Text> }];
    render(<Statistics stats={statsWithIcon} />);
    expect(screen.getByTestId('stat-icon')).toBeTruthy();
  });

  it('renders stat without icon (falsy branch)', () => {
    render(<Statistics stats={[{ value: '5', label: 'Count' }]} />);
    expect(screen.getByText('5')).toBeTruthy();
  });
});
