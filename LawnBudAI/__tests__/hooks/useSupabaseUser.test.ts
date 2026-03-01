import { renderHook, waitFor } from '@testing-library/react-native';
import { supabase } from '@/lib/supabase';

// The global setup.ts mocks this hook — unmock so we test the real implementation.
jest.unmock('@/hooks/useSupabaseUser');

// Mock supabase auth methods
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;
const CACHE_TTL = 5 * 60 * 1000; // must match hook's TTL constant

// Global counter that persists across all tests in this file.
// Each Date.now() call increments by CACHE_TTL+1, guaranteeing:
// - Cache check `now - cacheTimestamp` is ALWAYS > CACHE_TTL (cache miss)
// - Works regardless of how many Date.now() calls happen per test
let globalTimeCounter = 0;

describe('useSupabaseUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Re-spy on Date.now() with the globally-incrementing counter after each restoreAllMocks
    jest.spyOn(Date, 'now').mockImplementation(() => {
      globalTimeCounter += CACHE_TTL + 1;
      return globalTimeCounter;
    });

    // Default: onAuthStateChange returns a no-op subscription
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch and set user on mount', async () => {
    // Arrange
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    } as any);

    const { useSupabaseUser } = require('@/hooks/useSupabaseUser');

    // Act
    const { result } = renderHook(() => useSupabaseUser());

    // Wait for async fetch to complete and user to be set
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Assert
    expect(result.current.error).toBeNull();
    expect(mockAuth.getUser).toHaveBeenCalled();
  });

  it('should set error when getUser fails', async () => {
    // Arrange
    const authError = new Error('Auth service unavailable');
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: authError,
    } as any);

    const { useSupabaseUser } = require('@/hooks/useSupabaseUser');

    // Act
    const { result } = renderHook(() => useSupabaseUser());

    // Wait for error to be set (don't wait for loading — it may already be false from cache)
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should update user when auth state changes to signed-in', async () => {
    // Arrange — start with no user
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const sessionUser = { id: 'session-user', email: 'session@example.com' };
    let authChangeCallback: Function;

    mockAuth.onAuthStateChange.mockImplementation((callback: any) => {
      authChangeCallback = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } } as any;
    });

    const { useSupabaseUser } = require('@/hooks/useSupabaseUser');
    const { result } = renderHook(() => useSupabaseUser());

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Act — simulate user signing in
    authChangeCallback!('SIGNED_IN', { user: sessionUser });

    // Assert
    await waitFor(() => {
      expect(result.current.user).toEqual(sessionUser);
    });
  });

  it('should clear user when auth state changes to signed-out', async () => {
    // Arrange — return a user from getUser
    const existingUser = { id: 'user-456', email: 'other@example.com' };
    mockAuth.getUser.mockResolvedValue({
      data: { user: existingUser },
      error: null,
    } as any);

    let authChangeCallback: Function;
    mockAuth.onAuthStateChange.mockImplementation((callback: any) => {
      authChangeCallback = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } } as any;
    });

    const { useSupabaseUser } = require('@/hooks/useSupabaseUser');
    const { result } = renderHook(() => useSupabaseUser());

    // Wait for user to be fetched
    await waitFor(() => {
      expect(result.current.user).toEqual(existingUser);
    });

    // Act — simulate sign out
    authChangeCallback!('SIGNED_OUT', null);

    // Assert
    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });

  it('should call subscription.unsubscribe on unmount', async () => {
    // Arrange
    const mockUnsubscribe = jest.fn();
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    } as any);

    const { useSupabaseUser } = require('@/hooks/useSupabaseUser');
    const { result, unmount } = renderHook(() => useSupabaseUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Act
    unmount();

    // Assert
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
