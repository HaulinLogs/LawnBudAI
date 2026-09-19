import { supabase } from './supabase';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
}

/**
 * Check and enforce rate limiting for an endpoint.
 *
 * The caller's identity and their role's limit are both resolved inside the
 * SECURITY DEFINER RPC from auth.uid() and user_roles. Nothing about the
 * decision is supplied by the client, so passing a larger limit or another
 * user's id is not possible (#74).
 *
 * Fails closed: if the check cannot be completed, the request is denied.
 */
export async function checkRateLimit(endpoint: string): Promise<RateLimitResult> {
  const denied: RateLimitResult = { allowed: false, limit: 0, current: 0, remaining: 0 };

  try {
    const { data, error } = await supabase.rpc('check_and_increment_rate_limit', {
      p_endpoint: endpoint,
    });

    if (error || !data) {
      console.error('Rate limit check failed:', error);
      return denied;
    }

    const limit = Number(data.limit) || 0;
    const current = Number(data.current_count) || 0;

    return {
      allowed: Boolean(data.allowed),
      limit,
      current,
      remaining: Math.max(0, limit - current),
    };
  } catch (err) {
    console.error('Error during rate limit check:', err);
    return denied;
  }
}

/**
 * Check the rate limit and throw if it has been exceeded.
 */
export async function enforceRateLimit(endpoint: string): Promise<void> {
  const { allowed, limit } = await checkRateLimit(endpoint);
  if (!allowed) {
    throw new Error(`Rate limit exceeded for ${endpoint}. Max ${limit} requests/hour.`);
  }
}

/**
 * Get rate limit info for UI display.
 *
 * Note that this consumes a request from the caller's budget, because the
 * underlying RPC checks and increments atomically.
 */
export async function getRateLimitInfo(
  endpoint: string
): Promise<{ current: number; limit: number; remaining: number }> {
  const { current, limit, remaining } = await checkRateLimit(endpoint);
  return { current, limit, remaining };
}
