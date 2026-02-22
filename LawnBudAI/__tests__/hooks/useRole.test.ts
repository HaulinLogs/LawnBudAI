/**
 * Unit tests for useRole hook
 *
 * Tests role fetching, caching, and auth state changes
 * Mocks Supabase client
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock useSupabaseUser
jest.mock('@/hooks/useSupabaseUser');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for useSupabaseUser
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null,
    });
  });

  it('should initialize with default user role', () => {
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useRole());

    // With useSupabaseUser, when no user is authenticated, loading should be false
    expect(result.current.role).toBe('user');
    expect(result.current.loading).toBe(false);
  });

  it('should fetch and return user role from database', async () => {
    const userId = 'test-user-123';

    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: { id: userId },
      loading: false,
      error: null,
    });

    mockSupabase.from = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          maybeSingle: jest.fn().mockResolvedValueOnce({
            data: { role: 'premium' },
            error: null,
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBe('premium');
    expect(result.current.error).toBeNull();
  });

  it('should set isAdmin flag when role is admin', async () => {
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: { id: 'test-user' },
      loading: false,
      error: null,
    });

    mockSupabase.from = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          maybeSingle: jest.fn().mockResolvedValueOnce({
            data: { role: 'admin' },
            error: null,
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isPremium).toBe(true); // Admins have premium access
  });

  it('should set isPremium flag for premium and admin users', async () => {
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: { id: 'test-user' },
      loading: false,
      error: null,
    });

    mockSupabase.from = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          maybeSingle: jest.fn().mockResolvedValueOnce({
            data: { role: 'premium' },
            error: null,
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isPremium).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it('should return false for isPremium when user is free', async () => {
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: { id: 'test-user' },
      loading: false,
      error: null,
    });

    mockSupabase.from = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          maybeSingle: jest.fn().mockResolvedValueOnce({
            data: { role: 'user' },
            error: null,
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isPremium).toBe(false);
  });

  it('should handle database errors gracefully', async () => {
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: { id: 'test-user' },
      loading: false,
      error: null,
    });

    mockSupabase.from = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          maybeSingle: jest.fn().mockResolvedValueOnce({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should default to 'user' role on error
    expect(result.current.role).toBe('user');
    expect(result.current.error).toBeTruthy();
  });

  it('should handle auth check exceptions', async () => {
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: { id: 'test-user' },
      loading: false,
      error: new Error('Auth service down'),
    });

    mockSupabase.from = jest.fn().mockReturnValueOnce({
      select: jest.fn().mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          maybeSingle: jest.fn().mockResolvedValueOnce({
            data: { role: 'user' },
            error: null,
          }),
        }),
      }),
    } as any);

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBe('user');
  });

  it('should handle useSupabaseUser loading state', async () => {
    (useSupabaseUser as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      error: null,
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.loading).toBe(true);
  });
});
