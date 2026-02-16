/**
 * Unit tests for roleGuard utility functions
 *
 * These tests verify role hierarchy and permission checking logic
 * No mocking required — pure logic tests
 */

import { hasPermission, isAdminUser, isPremiumUser } from '@/lib/roleGuard';
import type { UserRole } from '@/hooks/useRole';

describe('roleGuard', () => {
  describe('hasPermission', () => {
    it('should allow users with equal or higher roles', () => {
      expect(hasPermission('admin', 'admin')).toBe(true);
      expect(hasPermission('premium', 'premium')).toBe(true);
      expect(hasPermission('user', 'user')).toBe(true);
    });

    it('should allow admins to access any permission level', () => {
      expect(hasPermission('admin', 'user')).toBe(true);
      expect(hasPermission('admin', 'premium')).toBe(true);
      expect(hasPermission('admin', 'admin')).toBe(true);
    });

    it('should allow premium users to access premium and user features', () => {
      expect(hasPermission('premium', 'user')).toBe(true);
      expect(hasPermission('premium', 'premium')).toBe(true);
    });

    it('should deny free users from accessing premium or admin features', () => {
      expect(hasPermission('user', 'premium')).toBe(false);
      expect(hasPermission('user', 'admin')).toBe(false);
    });

    it('should deny premium users from accessing admin features', () => {
      expect(hasPermission('premium', 'admin')).toBe(false);
    });
  });

  describe('isAdminUser', () => {
    it('should return true only for admin role', () => {
      expect(isAdminUser('admin')).toBe(true);
    });

    it('should return false for premium and user roles', () => {
      expect(isAdminUser('premium')).toBe(false);
      expect(isAdminUser('user')).toBe(false);
    });
  });

  describe('isPremiumUser', () => {
    it('should return true for premium and admin users', () => {
      expect(isPremiumUser('premium')).toBe(true);
      expect(isPremiumUser('admin')).toBe(true);
    });

    it('should return false for free users', () => {
      expect(isPremiumUser('user')).toBe(false);
    });
  });

  describe('role hierarchy', () => {
    const roles: UserRole[] = ['user', 'premium', 'admin'];

    it('should enforce strict hierarchy: user < premium < admin', () => {
      // Each role should have access to its own level
      roles.forEach((role) => {
        expect(hasPermission(role, role)).toBe(true);
      });

      // Higher roles should have access to lower role features
      expect(hasPermission('premium', 'user')).toBe(true);
      expect(hasPermission('admin', 'user')).toBe(true);
      expect(hasPermission('admin', 'premium')).toBe(true);

      // Lower roles should NOT have access to higher role features
      expect(hasPermission('user', 'premium')).toBe(false);
      expect(hasPermission('user', 'admin')).toBe(false);
      expect(hasPermission('premium', 'admin')).toBe(false);
    });
  });
});
