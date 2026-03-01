import { supabase } from '@/lib/supabase';
import {
  trackTelemetry,
  trackPageView,
  trackFeatureUsage,
  trackPerformance,
  trackAuthEvent,
  trackSecurityEvent,
} from '@/lib/telemetry';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('telemetry', () => {
  const mockInsert = jest.fn().mockResolvedValue({ error: null });

  beforeEach(() => {
    jest.clearAllMocks();

    (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });

    (mockSupabase.from as jest.Mock).mockReturnValue({
      insert: mockInsert,
    });
  });

  // Flush all pending microtasks (used for fire-and-forget callers)
  const flushAsync = () => new Promise(resolve => setTimeout(resolve, 0));

  describe('trackTelemetry', () => {
    it('should insert a telemetry event with correct fields', async () => {
      await trackTelemetry({
        event_type: 'page_view',
        event_name: 'HomeScreen',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('telemetry_events');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'page_view',
          event_name: 'HomeScreen',
          user_id: 'user-123',
        }),
      );
    });

    it('should include performance_ms when provided', async () => {
      await trackTelemetry({
        event_type: 'performance',
        event_name: 'api_call',
        performance_ms: 150,
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ performance_ms: 150 }),
      );
    });

    it('should include metadata when provided', async () => {
      await trackTelemetry({
        event_type: 'feature_usage',
        event_name: 'add_event',
        metadata: { source: 'button' },
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: { source: 'button' } }),
      );
    });

    it('should silently fail when supabase.auth.getUser throws', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      // Should not throw
      await expect(
        trackTelemetry({ event_type: 'page_view', event_name: 'HomeScreen' }),
      ).resolves.toBeUndefined();
    });

    it('should use provided timestamp when given', async () => {
      const ts = '2026-01-01T00:00:00.000Z';
      await trackTelemetry({
        event_type: 'auth',
        event_name: 'login_success',
        timestamp: ts,
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: ts }),
      );
    });

    it('should generate a timestamp when not provided', async () => {
      await trackTelemetry({
        event_type: 'auth',
        event_name: 'login_success',
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: expect.any(String) }),
      );
    });
  });

  describe('trackPageView', () => {
    it('should call trackTelemetry with page_view event type and screen name', async () => {
      trackPageView('MowingScreen');
      await flushAsync();

      expect(mockSupabase.from).toHaveBeenCalledWith('telemetry_events');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'page_view',
          event_name: 'MowingScreen',
        }),
      );
    });
  });

  describe('trackFeatureUsage', () => {
    it('should call trackTelemetry with feature_usage event type', async () => {
      trackFeatureUsage('add_mow_event');
      await flushAsync();

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'feature_usage',
          event_name: 'add_mow_event',
        }),
      );
    });

    it('should forward metadata to trackTelemetry', async () => {
      trackFeatureUsage('add_mow_event', { via: 'form_submit' });
      await flushAsync();

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: { via: 'form_submit' } }),
      );
    });
  });

  describe('trackPerformance', () => {
    it('should call trackTelemetry with performance event type and duration', async () => {
      trackPerformance('fetch_events', 250);
      await flushAsync();

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'performance',
          event_name: 'fetch_events',
          performance_ms: 250,
        }),
      );
    });

    it('should forward metadata to trackTelemetry', async () => {
      trackPerformance('fetch_events', 100, { table: 'mow_events' });
      await flushAsync();

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: { table: 'mow_events' } }),
      );
    });
  });

  describe('trackAuthEvent', () => {
    it('should call trackTelemetry with auth event type', async () => {
      trackAuthEvent('login_success');
      await flushAsync();

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'auth',
          event_name: 'login_success',
        }),
      );
    });

    it('should include metadata when provided', async () => {
      trackAuthEvent('login_failed', { error: 'bad creds', attempt_count: 2 });
      await flushAsync();

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_name: 'login_failed',
          metadata: { error: 'bad creds', attempt_count: 2 },
        }),
      );
    });

    it('should support all valid event names', async () => {
      const events = ['login_success', 'login_failed', 'signup', 'logout', 'password_reset'] as const;

      for (const eventName of events) {
        jest.clearAllMocks();
        trackAuthEvent(eventName);
        await flushAsync();
        expect(mockInsert).toHaveBeenCalledWith(
          expect.objectContaining({ event_name: eventName }),
        );
      }
    });
  });

  describe('trackSecurityEvent', () => {
    it('should insert event into security_events table with correct fields', async () => {
      await trackSecurityEvent('high', 'Brute force detected', { ip: '192.168.1.1' });

      expect(mockSupabase.from).toHaveBeenCalledWith('security_events');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'high',
          reason: 'Brute force detected',
          metadata: { ip: '192.168.1.1' },
          user_id: 'user-123',
        }),
      );
    });

    it('should support medium severity', async () => {
      await trackSecurityEvent('medium', 'Unusual pattern');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'medium' }),
      );
    });

    it('should support low severity', async () => {
      await trackSecurityEvent('low', 'Suspicious activity');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'low' }),
      );
    });

    it('should silently fail when supabase.auth.getUser throws', async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      await expect(
        trackSecurityEvent('low', 'test event'),
      ).resolves.toBeUndefined();
    });
  });
});
