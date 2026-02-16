import { supabase } from './supabase';
import { UserRole } from '@/hooks/useRole';

// Rate limits per hour by role
const LIMITS: Record<UserRole, number> = {
  user: 100,      // 100 requests/hour
  premium: 1000,  // 1,000 requests/hour
  admin: 999999,  // effectively unlimited
};

/**
 * Check and enforce rate limiting for an endpoint
 * This is called server-side via RPC, so rate limits cannot be bypassed by client
 *
 * @param endpoint The endpoint being called (e.g., 'weather_api', 'save_event')
 * @param role The user's role (fetched from useRole hook)
 * @returns { allowed: boolean, remaining: number }
 */
export async function checkRateLimit(
  endpoint: string,
  role: UserRole = 'user'
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { allowed: false, remaining: 0 };
    }

    const limit = LIMITS[role];

    // Call server-side RPC function to atomically check and increment
    const { data, error } = await supabase.rpc('check_and_increment_rate_limit', {
      p_user_id: user.id,
      p_endpoint: endpoint,
      p_limit: limit,
    });

    if (error) {
      console.error('Rate limit check failed:', error);
      // Fail open to avoid blocking users on error
      return { allowed: true, remaining: limit };
    }

    return {
      allowed: data.allowed,
      remaining: Math.max(0, data.limit - data.current_count),
    };
  } catch (err: any) {
    console.error('Error during rate limit check:', err);
    // Fail open to avoid blocking users on error
    return { allowed: true, remaining: 100 };
  }
}

/**
 * Higher-level wrapper: Check rate limit and throw error if exceeded
 * Use this in components or services to block operations
 */
export async function enforceRateLimit(
  endpoint: string,
  role: UserRole = 'user'
): Promise<void> {
  const { allowed } = await checkRateLimit(endpoint, role);
  if (!allowed) {
    throw new Error(`Rate limit exceeded for ${endpoint}. Max ${LIMITS[role]} requests/hour.`);
  }
}

/**
 * Get rate limit info without enforcing (for UI display)
 */
export async function getRateLimitInfo(
  endpoint: string,
  role: UserRole = 'user'
): Promise<{ current: number; limit: number; remaining: number }> {
  const { remaining } = await checkRateLimit(endpoint, role);
  const limit = LIMITS[role];
  return {
    current: limit - remaining,
    limit,
    remaining,
  };
}
