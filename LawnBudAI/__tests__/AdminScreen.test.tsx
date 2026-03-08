import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AdminScreen from '@/app/(tabs)/admin';
import { useRole } from '@/hooks/useRole';

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock useRole
jest.mock('@/hooks/useRole', () => ({
  useRole: jest.fn(),
}));

// Mock useAppTheme
jest.mock('@/hooks/useAppTheme', () => {
  const { lightColors } = jest.requireActual('@/hooks/useAppTheme');
  return {
    useAppTheme: jest.fn(() => lightColors),
    lightColors,
  };
});

const mockUseRole = useRole as jest.Mock;

describe('AdminScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Admin user', () => {
    it('renders the admin dashboard for admin users', () => {
      mockUseRole.mockReturnValue({ isAdmin: true, loading: false, role: 'admin', isPremium: true });

      render(<AdminScreen />);

      expect(screen.getByText('Admin Dashboard')).toBeTruthy();
    });

    it('does not redirect admin users', () => {
      mockUseRole.mockReturnValue({ isAdmin: true, loading: false, role: 'admin', isPremium: true });

      render(<AdminScreen />);

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('renders the Coming in Phase 2.5 message for admin users', () => {
      mockUseRole.mockReturnValue({ isAdmin: true, loading: false, role: 'admin', isPremium: true });

      render(<AdminScreen />);

      expect(screen.getByText('Coming in Phase 2.5')).toBeTruthy();
    });
  });

  describe('Non-admin user', () => {
    it('redirects non-admin user (role=user) to home tab', () => {
      mockUseRole.mockReturnValue({ isAdmin: false, loading: false, role: 'user', isPremium: false });

      render(<AdminScreen />);

      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });

    it('redirects premium (non-admin) user to home tab', () => {
      mockUseRole.mockReturnValue({ isAdmin: false, loading: false, role: 'premium', isPremium: true });

      render(<AdminScreen />);

      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });

    it('does not render admin content for non-admin users', () => {
      mockUseRole.mockReturnValue({ isAdmin: false, loading: false, role: 'user', isPremium: false });

      render(<AdminScreen />);

      expect(screen.queryByText('Admin Dashboard')).toBeNull();
    });
  });

  describe('Loading state', () => {
    it('renders nothing while role is loading', () => {
      mockUseRole.mockReturnValue({ isAdmin: false, loading: true, role: 'user', isPremium: false });

      render(<AdminScreen />);

      expect(screen.queryByText('Admin Dashboard')).toBeNull();
    });

    it('does not redirect while role is loading', () => {
      mockUseRole.mockReturnValue({ isAdmin: false, loading: true, role: 'user', isPremium: false });

      render(<AdminScreen />);

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
