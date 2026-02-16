/**
 * Unit tests for useRole hook
 *
 * Tests role fetching, caching, and auth state changes
 * Mocks Supabase client
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useRole } from '@/hooks/useRole';

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

import { supabase } from '@/lib/supabase';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for auth state subscription
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    } as any);
  });

  it('should initialize with default user role', () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.role).toBe('user');
    expect(result.current.loading).toBe(true); // Still loading initially
  });

  it('should fetch and return user role from database', async () => {
    const userId = 'test-user-123';

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: userId } },
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
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user' } },
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
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user' } },
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
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user' } },
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
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'test-user' } },
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
    mockSupabase.auth.getUser.mockRejectedValueOnce(new Error('Auth service down'));

    const { result } = renderHook(() => useRole());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.role).toBe('user');
    expect(result.current.error).toBeTruthy();
  });

  it('should unsubscribe from auth state changes on unmount', () => {
    const unsubscribeMock = jest.fn();
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: unsubscribeMock,
        },
      },
    } as any);

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const { unmount } = renderHook(() => useRole());

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
