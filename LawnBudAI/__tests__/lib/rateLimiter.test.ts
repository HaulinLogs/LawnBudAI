/**
 * Unit tests for rateLimiter utility functions
 *
 * Covers the hardened contract from #74: the client sends only the endpoint,
 * the server decides the limit, and the check fails closed.
 */

import {
  checkRateLimit,
  enforceRateLimit,
  getRateLimitInfo,
} from '@/lib/rateLimiter';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockRpc = mockSupabase.rpc as jest.Mock;

describe('rateLimiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should send only the endpoint, never a client-supplied limit or user id', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { allowed: true, current_count: 50, limit: 100 },
        error: null,
      });

      await checkRateLimit('test_endpoint');

      // Regression test for #74: p_limit and p_user_id were client-controlled,
      // so a caller could grant themselves an arbitrary limit or target another
      // user's counter.
      expect(mockRpc).toHaveBeenCalledWith('check_and_increment_rate_limit', {
        p_endpoint: 'test_endpoint',
      });

      const [, params] = mockRpc.mock.calls[0];
      expect(params).not.toHaveProperty('p_limit');
      expect(params).not.toHaveProperty('p_user_id');
    });

    it('should return allowed=true when rate limit not exceeded', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { allowed: true, current_count: 50, limit: 100 },
        error: null,
      });

      const result = await checkRateLimit('test_endpoint');

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(100);
      expect(result.current).toBe(50);
      expect(result.remaining).toBe(50);
    });

    it('should return allowed=false when rate limit exceeded', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { allowed: false, current_count: 100, limit: 100 },
        error: null,
      });

      const result = await checkRateLimit('test_endpoint');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should take the limit from the server response, not from the client', async () => {
      // The server resolves the role from user_roles; the client has no say.
      mockRpc.mockResolvedValueOnce({
        data: { allowed: true, current_count: 500, limit: 1000 },
        error: null,
      });

      const result = await checkRateLimit('test_endpoint');

      expect(result.limit).toBe(1000);
      expect(result.remaining).toBe(500);
    });

    it('should fail closed when the RPC returns an error', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: new Error('RPC connection failed'),
      });

      const result = await checkRateLimit('test_endpoint');

      // Regression test for #74: this previously failed open, so forcing an
      // error was enough to bypass the limit entirely.
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should fail closed when the RPC throws', async () => {
      mockRpc.mockRejectedValueOnce(new Error('network down'));

      const result = await checkRateLimit('test_endpoint');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should fail closed when the RPC resolves without data', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: null });

      const result = await checkRateLimit('test_endpoint');

      expect(result.allowed).toBe(false);
    });
  });

  describe('enforceRateLimit', () => {
    it('should throw error when rate limit exceeded', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { allowed: false, current_count: 100, limit: 100 },
        error: null,
      });

      await expect(enforceRateLimit('test_endpoint')).rejects.toThrow(
        'Rate limit exceeded for test_endpoint. Max 100 requests/hour.'
      );
    });

    it('should throw when the check could not be completed', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: new Error('RPC connection failed'),
      });

      await expect(enforceRateLimit('test_endpoint')).rejects.toThrow(
        'Rate limit exceeded for test_endpoint'
      );
    });

    it('should not throw when rate limit not exceeded', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { allowed: true, current_count: 50, limit: 100 },
        error: null,
      });

      await expect(enforceRateLimit('test_endpoint')).resolves.not.toThrow();
    });
  });

  describe('getRateLimitInfo', () => {
    it('should return rate limit info with current, limit, and remaining counts', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { allowed: true, current_count: 75, limit: 100 },
        error: null,
      });

      const info = await getRateLimitInfo('test_endpoint');

      expect(info.current).toBe(75);
      expect(info.limit).toBe(100);
      expect(info.remaining).toBe(25);
    });

    it('should show zero remaining when limit is reached', async () => {
      mockRpc.mockResolvedValueOnce({
        data: { allowed: false, current_count: 100, limit: 100 },
        error: null,
      });

      const info = await getRateLimitInfo('test_endpoint');

      expect(info.remaining).toBe(0);
    });
  });
});
