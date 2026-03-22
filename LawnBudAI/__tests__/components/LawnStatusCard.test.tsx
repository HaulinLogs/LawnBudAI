/**
 * Tests for the LawnStatusCard component
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LawnStatusCard } from '@/components/LawnStatusCard';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

describe('LawnStatusCard', () => {
  it('renders the title', () => {
    render(<LawnStatusCard title="Lawn Status" weather="Sunny" />);
    expect(screen.getByText('Lawn Status')).toBeTruthy();
  });

  it('renders the weather description', () => {
    render(<LawnStatusCard title="Status" weather="Cloudy" />);
    expect(screen.getByText('Cloudy')).toBeTruthy();
  });

  it('shows "Loading..." when weather is null', () => {
    render(<LawnStatusCard title="Status" weather={null} />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('shows watering tip when no rain', () => {
    render(<LawnStatusCard title="Status" weather="Sunny" />);
    expect(screen.getByText('Consider watering the lawn.')).toBeTruthy();
  });

  it('shows no-water tip when weather includes Rain', () => {
    render(<LawnStatusCard title="Status" weather="Rain showers" />);
    expect(screen.getByText('No need to water today!')).toBeTruthy();
  });
});
