/**
 * Telemetry and Analytics System
 *
 * Tracks:
 * - Usage metrics (no PII - anonymized by user_id only)
 * - Performance metrics (API latency, page load times)
 * - Security events (auth failures, suspicious activity)
 * - Feature adoption
 *
 * All data is stored in Supabase and can be queried for dashboards
 */

import { supabase } from './supabase';

export interface TelemetryEvent {
  event_type: 'page_view' | 'feature_usage' | 'performance' | 'auth' | 'error' | 'security';
  user_id?: string; // Anonymized - never PII
  event_name: string;
  metadata?: Record<string, any>; // No email, names, or sensitive data
  timestamp?: string;
  performance_ms?: number;
}

/**
 * Track any telemetry event
 * Do NOT include: emails, names, phone numbers, addresses, or any PII
 */
export async function trackTelemetry(event: TelemetryEvent) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Insert anonymized telemetry event
    await supabase.from('telemetry_events').insert({
      event_type: event.event_type,
      user_id: user?.id, // Only UUID, no PII
      event_name: event.event_name,
      metadata: event.metadata,
      timestamp: event.timestamp || new Date().toISOString(),
      performance_ms: event.performance_ms,
    });
  } catch (error) {
    console.warn('Failed to track telemetry:', error);
    // Silently fail - don't let telemetry errors break the app
  }
}

/**
 * Track page/screen views
 */
export function trackPageView(screenName: string) {
  trackTelemetry({
    event_type: 'page_view',
    event_name: screenName,
  });
}

/**
 * Track feature usage (completely anonymized)
 */
export function trackFeatureUsage(featureName: string, metadata?: Record<string, any>) {
  trackTelemetry({
    event_type: 'feature_usage',
    event_name: featureName,
    metadata, // Keep metadata generic - no user info
  });
}

/**
 * Track API/performance metrics
 */
export function trackPerformance(
  operationName: string,
  durationMs: number,
  metadata?: Record<string, any>
) {
  trackTelemetry({
    event_type: 'performance',
    event_name: operationName,
    performance_ms: durationMs,
    metadata,
  });
}

/**
 * SECURITY: Track authentication events
 * Use for monitoring brute force, suspicious patterns, etc.
 */
export function trackAuthEvent(
  eventName: 'login_success' | 'login_failed' | 'signup' | 'logout' | 'password_reset',
  metadata?: {
    error?: string; // Generic error message only, no details
    attempt_count?: number;
    ip_hint?: string; // Can use environment variables if available
  }
) {
  trackTelemetry({
    event_type: 'auth',
    event_name: eventName,
    metadata,
  });
}

/**
 * SECURITY: Track suspicious activity
 * Threshold examples: 5+ failed logins in 5 min, impossible travel, unusual device
 */
export async function trackSecurityEvent(
  severity: 'low' | 'medium' | 'high',
  reason: string,
  metadata?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Insert security event (may want to alert on this)
    await supabase.from('security_events').insert({
      user_id: user?.id,
      severity,
      reason,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // TODO: For critical events, send immediate notification
    // if (severity === 'high') {
    //   await notifyOwner({ severity, reason, timestamp: new Date() });
    // }
  } catch (error) {
    console.error('Failed to track security event:', error);
  }
}
