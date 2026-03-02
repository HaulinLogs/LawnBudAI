/**
 * Component tests for PremiumGate
 *
 * Tests rendering, feature name display, and upgrade button navigation
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PremiumGate } from '@/components/PremiumGate';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));
const mockUseColorScheme = useColorScheme as jest.Mock;

const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('PremiumGate', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockRouter.mockReturnValue({
      push: mockPush,
    } as any);
    mockUseColorScheme.mockReturnValue('light');
  });

  it('should render premium gate UI', () => {
    render(<PremiumGate feature="Smart Recommendations" />);

    expect(screen.getByText('Premium Feature')).toBeTruthy();
    expect(screen.getByText(/Smart Recommendations/)).toBeTruthy();
  });

  it('should display the feature name in description', () => {
    const featureName = 'Advanced Analytics';
    render(<PremiumGate feature={featureName} />);

    expect(screen.getByText(featureName)).toBeTruthy();
  });

  it('should display benefits list', () => {
    render(<PremiumGate feature="Test Feature" />);

    expect(screen.getByText('Smart AI recommendations')).toBeTruthy();
    expect(screen.getByText('Advanced analytics')).toBeTruthy();
    expect(screen.getByText('Higher API limits')).toBeTruthy();
  });

  it('should display upgrade button', () => {
    render(<PremiumGate feature="Test Feature" />);

    const upgradeButton = screen.getByText('Upgrade to Premium');
    expect(upgradeButton).toBeTruthy();
  });

  it('should display pricing information', () => {
    render(<PremiumGate feature="Test Feature" />);

    expect(screen.getByText(/7 days free/)).toBeTruthy();
    expect(screen.getByText(/\$2.99\/month/)).toBeTruthy();
    expect(screen.getByText(/Cancel anytime/)).toBeTruthy();
  });

  it('should navigate to upgrade screen when upgrade button is pressed', () => {
    render(<PremiumGate feature="Test Feature" />);

    const upgradeButton = screen.getByText('Upgrade to Premium');
    fireEvent.press(upgradeButton);

    expect(mockPush).toHaveBeenCalledWith('/(tabs)/upgrade');
  });

  it('should work with different feature names', () => {
    const { rerender } = render(<PremiumGate feature="Feature A" />);
    expect(screen.getByText('Feature A')).toBeTruthy();

    rerender(<PremiumGate feature="Feature B" />);
    expect(screen.getByText('Feature B')).toBeTruthy();
  });

  describe('dark mode', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('dark');
    });

    it('renders premium gate UI in dark mode', () => {
      render(<PremiumGate feature="Smart Recommendations" />);
      expect(screen.getByText('Premium Feature')).toBeTruthy();
      expect(screen.getByText(/Smart Recommendations/)).toBeTruthy();
    });

    it('displays all benefits in dark mode', () => {
      render(<PremiumGate feature="Test Feature" />);
      expect(screen.getByText('Smart AI recommendations')).toBeTruthy();
      expect(screen.getByText('Advanced analytics')).toBeTruthy();
      expect(screen.getByText('Higher API limits')).toBeTruthy();
    });

    it('displays pricing information in dark mode', () => {
      render(<PremiumGate feature="Test Feature" />);
      expect(screen.getByText(/7 days free/)).toBeTruthy();
      expect(screen.getByText(/\$2.99\/month/)).toBeTruthy();
    });

    it('navigates to upgrade screen in dark mode', () => {
      render(<PremiumGate feature="Test Feature" />);
      fireEvent.press(screen.getByText('Upgrade to Premium'));
      expect(mockPush).toHaveBeenCalledWith('/(tabs)/upgrade');
    });
  });
});
