/**
 * Error Tracking Utility
 *
 * This module handles error reporting and owner notifications.
 * Currently logs to console; integrate with a service like:
 * - Sentry (https://sentry.io)
 * - LogRocket (https://logrocket.com)
 * - Custom webhook endpoint
 * - PagerDuty for critical errors
 */

export interface ErrorContext {
  timestamp: string;
  userId?: string;
  errorType: 'api' | 'auth' | 'network' | 'database' | 'permission' | 'other';
  message: string;
  context?: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Tracks an error and sends notification to monitoring service
 * In production, integrate with your error tracking service
 */
export async function trackError(errorContext: ErrorContext) {
  const fullError = {
    ...errorContext,
    timestamp: new Date().toISOString(),
    appVersion: '1.0.0',
    environment: __DEV__ ? 'development' : 'production',
  };

  // Always log to console in development
  console.error(`[${errorContext.errorType.toUpperCase()}]`, fullError);

  // TODO: In production, send to error tracking service
  // Example implementations below:

  // Option 1: Sentry
  // import * as Sentry from "@sentry/react-native";
  // Sentry.captureException(new Error(errorContext.message), {
  //   tags: { errorType: errorContext.errorType, severity: errorContext.severity },
  //   contexts: { app: errorContext.context },
  // });

  // Option 2: Custom webhook (great for critical errors)
  // if (errorContext.severity === 'critical') {
  //   try {
  //     await fetch(process.env.EXPO_PUBLIC_ERROR_WEBHOOK_URL!, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(fullError),
  //     });
  //   } catch (err) {
  //     console.error('Failed to send error webhook:', err);
  //   }
  // }

  // Option 3: LogRocket
  // import LogRocket from 'logrocket';
  // LogRocket.captureException(new Error(errorContext.message), {
  //   tags: errorContext.context,
  // });
}

/**
 * Quick error logging helpers
 */
export const trackWeatherError = (error: string, city: string) => {
  trackError({
    errorType: 'api',
    message: `Weather API failed for city: ${city}`,
    context: { error, city },
    severity: 'warning',
  });
};

export const trackAuthError = (error: string) => {
  trackError({
    errorType: 'auth',
    message: error,
    severity: 'error',
  });
};

export const trackDatabaseError = (error: string, table?: string) => {
  trackError({
    errorType: 'database',
    message: `Database error${table ? ` in ${table}` : ''}`,
    context: { error, table },
    severity: 'error',
  });
};

export const trackNetworkError = (error: string, endpoint?: string) => {
  trackError({
    errorType: 'network',
    message: `Network error${endpoint ? ` at ${endpoint}` : ''}`,
    context: { error, endpoint },
    severity: 'warning',
  });
};
