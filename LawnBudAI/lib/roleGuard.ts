import { UserRole } from '@/hooks/useRole';

/**
 * Check if a user's role meets or exceeds the required role
 * Role hierarchy: user (0) < premium (1) < admin (2)
 *
 * Example:
 * - hasPermission('premium', 'premium') → true
 * - hasPermission('admin', 'premium') → true  (admins have all permissions)
 * - hasPermission('user', 'premium') → false
 */
export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const hierarchy: Record<UserRole, number> = {
    user: 0,
    premium: 1,
    admin: 2,
  };
  return hierarchy[userRole] >= hierarchy[requiredRole];
}

/**
 * Check if user can access admin features
 */
export function isAdminUser(role: UserRole): boolean {
  return role === 'admin';
}

/**
 * Check if user has paid premium
 */
export function isPremiumUser(role: UserRole): boolean {
  return role === 'premium' || role === 'admin';
}
