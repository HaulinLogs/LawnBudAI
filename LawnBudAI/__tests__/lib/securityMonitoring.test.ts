import {
  checkBruteForcePattern,
  recordSuccessfulLogin,
  recordFailedLogin,
  checkUnusualPattern,
} from '@/lib/securityMonitoring';
import { trackAuthEvent, trackSecurityEvent } from '@/lib/telemetry';

// Mock the telemetry module — securityMonitoring imports from it
jest.mock('@/lib/telemetry', () => ({
  trackAuthEvent: jest.fn(),
  trackSecurityEvent: jest.fn().mockResolvedValue(undefined),
}));

const mockTrackAuthEvent = trackAuthEvent as jest.Mock;
const mockTrackSecurityEvent = trackSecurityEvent as jest.Mock;

// The failedLoginAttempts Map is module-level and persists within a test run.
// Each test uses a UNIQUE identifier to avoid cross-test pollution.

describe('securityMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkBruteForcePattern', () => {
    it('should return false for a first failed attempt', async () => {
      const result = await checkBruteForcePattern('bf-first@test.com');
      expect(result).toBe(false);
    });

    it('should return false for a second failed attempt (below threshold)', async () => {
      await checkBruteForcePattern('bf-second@test.com');
      const result = await checkBruteForcePattern('bf-second@test.com');
      expect(result).toBe(false);
    });

    it('should return true and call trackSecurityEvent after 3 failed attempts', async () => {
      await checkBruteForcePattern('bf-three@test.com');
      await checkBruteForcePattern('bf-three@test.com');
      const result = await checkBruteForcePattern('bf-three@test.com');

      expect(result).toBe(true);
      expect(mockTrackSecurityEvent).toHaveBeenCalledWith(
        'medium',
        expect.stringContaining('Brute force'),
        expect.objectContaining({ failed_attempt_count: 3 }),
      );
    });

    it('should reset count when the time window has expired', async () => {
      const WINDOW_MS = 5 * 60 * 1000;
      let callIndex = 0;

      jest.spyOn(Date, 'now').mockImplementation(() => {
        callIndex++;
        // First invocation returns 0; second invocation is after the window
        return callIndex === 1 ? 0 : WINDOW_MS + 1;
      });

      // First attempt at t=0: count = 1, not suspicious
      await checkBruteForcePattern('bf-window@test.com');

      // Second attempt at t=WINDOW_MS+1: window expired → count resets to 0, then count++ = 1
      const result = await checkBruteForcePattern('bf-window@test.com');

      expect(result).toBe(false);

      jest.restoreAllMocks();
    });
  });

  describe('recordSuccessfulLogin', () => {
    it('should call trackAuthEvent with login_success', () => {
      recordSuccessfulLogin('success@test.com');
      expect(mockTrackAuthEvent).toHaveBeenCalledWith('login_success');
    });

    it('should clear the failed-attempts counter for the identifier', async () => {
      // Build up 2 failed attempts so count=2
      await checkBruteForcePattern('clear-test@test.com');
      await checkBruteForcePattern('clear-test@test.com');

      // Successful login clears the Map entry
      recordSuccessfulLogin('clear-test@test.com');

      // Next failure starts fresh (count=1), so still not suspicious
      const result = await checkBruteForcePattern('clear-test@test.com');
      expect(result).toBe(false);
    });
  });

  describe('recordFailedLogin', () => {
    it('should call trackAuthEvent with login_failed and normalised error', async () => {
      await recordFailedLogin('fail1@test.com', 'Invalid credentials');

      expect(mockTrackAuthEvent).toHaveBeenCalledWith('login_failed', {
        error: expect.any(String),
      });
    });

    it('should pass undefined error when no error string is provided', async () => {
      await recordFailedLogin('fail2@test.com');

      expect(mockTrackAuthEvent).toHaveBeenCalledWith('login_failed', {
        error: undefined,
      });
    });

    it('should redact email addresses from error messages', async () => {
      await recordFailedLogin('redact@test.com', 'Login failed for user@example.com');

      const callArg = mockTrackAuthEvent.mock.calls[0][1];
      expect(callArg.error).not.toContain('user@example.com');
      expect(callArg.error).toContain('[email]');
    });

    it('should redact IP addresses from error messages', async () => {
      await recordFailedLogin('redact-ip@test.com', 'Blocked from 192.168.1.100');

      const callArg = mockTrackAuthEvent.mock.calls[0][1];
      expect(callArg.error).not.toContain('192.168.1.100');
      expect(callArg.error).toContain('[ip]');
    });

    it('should call checkBruteForcePattern internally', async () => {
      // checkBruteForcePattern runs; if suspicious, a security event fires.
      // We have already used 3 attempts for 'bf-three@test.com' in earlier test.
      // Use a fresh identifier here.
      await recordFailedLogin('brute-check@test.com', 'bad creds');

      // trackAuthEvent should have been called
      expect(mockTrackAuthEvent).toHaveBeenCalled();
    });
  });

  describe('checkUnusualPattern', () => {
    it('should resolve without error (no-op implementation)', async () => {
      await expect(
        checkUnusualPattern('user-123', 'login', { country: 'US' }),
      ).resolves.toBeUndefined();
    });

    it('should resolve even without optional metadata', async () => {
      await expect(
        checkUnusualPattern('user-456', 'page_view'),
      ).resolves.toBeUndefined();
    });
  });
});
