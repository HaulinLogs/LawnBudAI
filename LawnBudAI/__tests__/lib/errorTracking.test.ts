import {
  trackError,
  trackWeatherError,
  trackAuthError,
  trackDatabaseError,
  trackNetworkError,
} from '@/lib/errorTracking';

describe('errorTracking', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('trackError', () => {
    it('should log the error to console', async () => {
      await trackError({
        errorType: 'api',
        message: 'API failed',
        severity: 'warning',
      });

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should include appVersion and environment in the logged output', async () => {
      await trackError({
        errorType: 'network',
        message: 'Network timeout',
        severity: 'error',
      });

      const loggedArg = consoleSpy.mock.calls[0][1];
      expect(loggedArg).toHaveProperty('appVersion', '1.0.0');
      expect(loggedArg).toHaveProperty('environment');
    });

    it('should include a generated timestamp', async () => {
      await trackError({
        errorType: 'database',
        message: 'Query failed',
        severity: 'error',
      });

      const loggedArg = consoleSpy.mock.calls[0][1];
      expect(loggedArg).toHaveProperty('timestamp');
      expect(typeof loggedArg.timestamp).toBe('string');
    });

    it('should handle all error types without throwing', async () => {
      const errorTypes = ['api', 'auth', 'network', 'database', 'permission', 'other'] as const;

      for (const errorType of errorTypes) {
        await expect(
          trackError({ errorType, message: 'test', severity: 'info' }),
        ).resolves.toBeUndefined();
      }
    });

    it('should handle all severity levels without throwing', async () => {
      const severities = ['info', 'warning', 'error', 'critical'] as const;

      for (const severity of severities) {
        await expect(
          trackError({ errorType: 'other', message: 'test', severity }),
        ).resolves.toBeUndefined();
      }
    });

    it('should include context when provided', async () => {
      await trackError({
        errorType: 'api',
        message: 'Failed',
        severity: 'warning',
        context: { endpoint: '/api/v1/data', status: 500 },
      });

      const loggedArg = consoleSpy.mock.calls[0][1];
      expect(loggedArg.context).toEqual({ endpoint: '/api/v1/data', status: 500 });
    });

    it('should include userId when provided', async () => {
      await trackError({
        errorType: 'auth',
        message: 'Unauthorized',
        severity: 'error',
        userId: 'user-abc',
      });

      const loggedArg = consoleSpy.mock.calls[0][1];
      expect(loggedArg.userId).toBe('user-abc');
    });
  });

  describe('trackWeatherError', () => {
    it('should call trackError with api error type and city in context', async () => {
      trackWeatherError('Timeout', 'Madison');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalled();
      const loggedArg = consoleSpy.mock.calls[0][1];
      expect(loggedArg.errorType).toBe('api');
      expect(loggedArg.context).toMatchObject({ city: 'Madison', error: 'Timeout' });
    });
  });

  describe('trackAuthError', () => {
    it('should call trackError with auth error type', async () => {
      trackAuthError('Token expired');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalled();
      const loggedArg = consoleSpy.mock.calls[0][1];
      expect(loggedArg.errorType).toBe('auth');
      expect(loggedArg.message).toBe('Token expired');
    });
  });

  describe('trackDatabaseError', () => {
    it('should call trackError with database error type', async () => {
      trackDatabaseError('Insert failed', 'mow_events');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalled();
      const loggedArg = consoleSpy.mock.calls[0][1];
      expect(loggedArg.errorType).toBe('database');
      expect(loggedArg.context).toMatchObject({ table: 'mow_events' });
    });

    it('should work without a table name', async () => {
      trackDatabaseError('Unknown error');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalled();
      const loggedArg = consoleSpy.mock.calls[0][1];
      expect(loggedArg.errorType).toBe('database');
    });
  });

  describe('trackNetworkError', () => {
    it('should call trackError with network error type', async () => {
      trackNetworkError('ECONNREFUSED', '/api/weather');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalled();
      const loggedArg = consoleSpy.mock.calls[0][1];
      expect(loggedArg.errorType).toBe('network');
      expect(loggedArg.context).toMatchObject({ endpoint: '/api/weather' });
    });

    it('should work without an endpoint', async () => {
      trackNetworkError('Network unreachable');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalled();
      const loggedArg = consoleSpy.mock.calls[0][1];
      expect(loggedArg.errorType).toBe('network');
    });
  });
});
