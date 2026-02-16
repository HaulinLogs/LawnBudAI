/**
 * Unit tests for rateLimiter utility functions
 *
 * Tests rate limit checking and enforcement logic
 * Mocks Supabase client and RPC responses
 */

import {
  checkRateLimit,
  enforceRateLimit,
  getRateLimitInfo,
} from '@/lib/rateLimiter';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
  },
}));

import { supabase } from '@/lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('rateLimiter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should return allowed=false when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const result = await checkRateLimit('test_endpoint', 'user');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should return allowed=true when rate limit not exceeded', async () => {
      const userId = 'test-user-123';
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: userId } },
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          allowed: true,
          current_count: 50,
          limit: 100,
        },
        error: null,
      });

      const result = await checkRateLimit('test_endpoint', 'user');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(50); // 100 - 50
      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_and_increment_rate_limit', {
        p_user_id: userId,
        p_endpoint: 'test_endpoint',
        p_limit: 100,
      });
    });

    it('should return allowed=false when rate limit exceeded', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          allowed: false,
          current_count: 100,
          limit: 100,
        },
        error: null,
      });

      const result = await checkRateLimit('test_endpoint', 'user');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should apply correct limit for premium users', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          allowed: true,
          current_count: 500,
          limit: 1000,
        },
        error: null,
      });

      await checkRateLimit('test_endpoint', 'premium');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_and_increment_rate_limit', {
        p_user_id: 'test-user',
        p_endpoint: 'test_endpoint',
        p_limit: 1000, // Premium limit
      });
    });

    it('should apply unlimited limit for admin users', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          allowed: true,
          current_count: 999998,
          limit: 999999,
        },
        error: null,
      });

      await checkRateLimit('test_endpoint', 'admin');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_and_increment_rate_limit', {
        p_user_id: 'test-user',
        p_endpoint: 'test_endpoint',
        p_limit: 999999, // Admin limit (effectively unlimited)
      });
    });

    it('should fail open when RPC call errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: new Error('RPC connection failed'),
      });

      const result = await checkRateLimit('test_endpoint', 'user');

      // Should fail open (allow the request) to prevent blocking users on errors
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(100); // Returns the limit, not actual count
    });

    it('should handle exceptions gracefully', async () => {
      mockSupabase.auth.getUser.mockRejectedValueOnce(new Error('Auth check failed'));

      const result = await checkRateLimit('test_endpoint', 'user');

      expect(result.allowed).toBe(true); // Fail open
      expect(result.remaining).toBe(100);
    });
  });

  describe('enforceRateLimit', () => {
    it('should throw error when rate limit exceeded', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          allowed: false,
          current_count: 100,
          limit: 100,
        },
        error: null,
      });

      await expect(enforceRateLimit('test_endpoint', 'user')).rejects.toThrow(
        'Rate limit exceeded for test_endpoint. Max 100 requests/hour.'
      );
    });

    it('should not throw when rate limit not exceeded', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          allowed: true,
          current_count: 50,
          limit: 100,
        },
        error: null,
      });

      await expect(enforceRateLimit('test_endpoint', 'user')).resolves.not.toThrow();
    });
  });

  describe('getRateLimitInfo', () => {
    it('should return rate limit info with current, limit, and remaining counts', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          allowed: true,
          current_count: 75,
          limit: 100,
        },
        error: null,
      });

      const info = await getRateLimitInfo('test_endpoint', 'user');

      expect(info.current).toBe(75);
      expect(info.limit).toBe(100);
      expect(info.remaining).toBe(25);
    });

    it('should show zero remaining when limit is reached', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'test-user' } },
        error: null,
      });

      mockSupabase.rpc.mockResolvedValueOnce({
        data: {
          allowed: false,
          current_count: 100,
          limit: 100,
        },
        error: null,
      });

      const info = await getRateLimitInfo('test_endpoint', 'user');

      expect(info.remaining).toBe(0);
    });
  });
});
