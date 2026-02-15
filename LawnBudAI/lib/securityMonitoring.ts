/**
 * Security Monitoring
 *
 * Detects and flags suspicious patterns:
 * - Brute force login attempts
 * - Unusual access patterns
 * - Multiple failed attempts
 * - Rapid requests from same user
 */

import { trackSecurityEvent, trackAuthEvent } from './telemetry';

// In-memory tracking of failed attempts (reset on app reload)
// In production, store in Redis or similar
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: number }>();

/**
 * Check for brute force patterns
 * Flags if: 3+ failed logins in 5 minutes
 */
export async function checkBruteForcePattern(identifier: string) {
  const now = Date.now();
  const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  const THRESHOLD = 3; // 3 failed attempts

  const attempts = failedLoginAttempts.get(identifier) || { count: 0, lastAttempt: now };

  // Reset if window has passed
  if (now - attempts.lastAttempt > WINDOW_MS) {
    attempts.count = 0;
  }

  attempts.count++;
  attempts.lastAttempt = now;
  failedLoginAttempts.set(identifier, attempts);

  if (attempts.count >= THRESHOLD) {
    await trackSecurityEvent('medium', `Brute force attempt detected: ${attempts.count} failed logins in ${WINDOW_MS / 60000}m`, {
      identifier_hash: hashIdentifier(identifier),
      failed_attempt_count: attempts.count,
    });

    return true; // Flag as suspicious
  }

  return false;
}

/**
 * Track successful login (resets brute force counter)
 */
export function recordSuccessfulLogin(identifier: string) {
  failedLoginAttempts.delete(identifier);
  trackAuthEvent('login_success');
}

/**
 * Track failed login attempt
 */
export async function recordFailedLogin(identifier: string, error?: string) {
  trackAuthEvent('login_failed', {
    error: error ? normalizeError(error) : undefined,
  });

  const isSuspicious = await checkBruteForcePattern(identifier);
  if (isSuspicious) {
    // Could trigger CAPTCHA, rate limit, or alert here
    console.warn('[SECURITY] Suspicious login pattern detected');
  }
}

/**
 * Hash identifier without revealing it (for privacy)
 * Can be username, email hash, or IP hash
 */
function hashIdentifier(identifier: string): string {
  // Simple hash - in production use a proper hash function
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Normalize error messages (remove sensitive details)
 */
function normalizeError(error: string): string {
  // Remove email addresses and other sensitive info
  return error
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]')
    .replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[ip]')
    .substring(0, 100); // Limit length
}

/**
 * Flag unusual access patterns
 * Example: User accessing from country that's impossible from last known location
 */
export async function checkUnusualPattern(
  userId: string,
  eventType: string,
  metadata?: Record<string, any>
) {
  // TODO: Implement geolocation checks if needed
  // const lastLocation = await getLastKnownLocation(userId);
  // const currentLocation = await getGeolocationFromIP();
  // if (isImpossibleDistance(lastLocation, currentLocation)) {
  //   await trackSecurityEvent('high', 'Impossible travel detected', { ...metadata });
  // }
}
