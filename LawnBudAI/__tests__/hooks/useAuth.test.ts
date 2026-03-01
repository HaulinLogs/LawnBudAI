import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/hooks/useRole';
import { recordSuccessfulLogin, recordFailedLogin } from '@/lib/securityMonitoring';
import { trackAuthEvent } from '@/lib/telemetry';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Mock useRole
jest.mock('@/hooks/useRole', () => ({
  useRole: jest.fn(() => ({
    role: 'user',
    isAdmin: false,
    isPremium: false,
    loading: false,
    error: null,
  })),
}));

// Mock security monitoring
jest.mock('@/lib/securityMonitoring', () => ({
  recordSuccessfulLogin: jest.fn(),
  recordFailedLogin: jest.fn().mockResolvedValue(undefined),
  checkBruteForcePattern: jest.fn().mockResolvedValue(false),
}));

// Mock telemetry
jest.mock('@/lib/telemetry', () => ({
  trackAuthEvent: jest.fn(),
  trackTelemetry: jest.fn(),
}));

const mockSupabaseAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;

describe('useAuth', () => {
  const mockSession = {
    access_token: 'mock-token',
    user: { id: 'user-123', email: 'test@example.com' },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default: onAuthStateChange returns no-op subscription
    mockSupabaseAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    } as any);

    // Default: getSession returns no active session
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
    } as any);
  });

  describe('initialization', () => {
    it('should set session on successful getSession', async () => {
      // Arrange
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
      } as any);

      // Act
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.session).toEqual(mockSession);
    });

    it('should set null session when no active session', async () => {
      // Arrange — default mock returns null session

      // Act
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.session).toBeNull();
    });

    it('should set error when getSession rejects', async () => {
      // Arrange
      mockSupabaseAuth.getSession.mockRejectedValue(new Error('Network error'));

      // Act
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('signIn', () => {
    it('should call recordSuccessfulLogin on successful sign in', async () => {
      // Arrange
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      // Assert
      expect(recordSuccessfulLogin).toHaveBeenCalledWith('test@example.com');
    });

    it('should call recordFailedLogin when sign in returns auth error', async () => {
      // Arrange
      const authError = { message: 'Invalid credentials' };
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.signIn('test@example.com', 'wrongpassword');
      });

      // Assert
      expect(recordFailedLogin).toHaveBeenCalledWith('test@example.com', authError.message);
    });

    it('should throw and call recordFailedLogin when signInWithPassword throws', async () => {
      // Arrange
      mockSupabaseAuth.signInWithPassword.mockRejectedValue(new Error('Network failure'));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.signIn('test@example.com', 'password123');
        })
      ).rejects.toThrow('Network failure');

      expect(recordFailedLogin).toHaveBeenCalledWith('test@example.com', 'Network failure');
    });

    it('should pass email and password to supabase.auth.signInWithPassword', async () => {
      // Arrange
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.signIn('user@example.com', 'mypassword');
      });

      // Assert
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'mypassword',
      });
    });
  });

  describe('signUp', () => {
    it('should call trackAuthEvent signup on success', async () => {
      // Arrange
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: mockSession.user, session: null },
        error: null,
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.signUp('new@example.com', 'password123');
      });

      // Assert
      expect(trackAuthEvent).toHaveBeenCalledWith('signup');
    });

    it('should not call trackAuthEvent when signUp returns an error', async () => {
      // Arrange
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already taken' },
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.signUp('existing@example.com', 'password123');
      });

      // Assert — trackAuthEvent should NOT be called with 'signup'
      expect(trackAuthEvent).not.toHaveBeenCalledWith('signup');
    });
  });

  describe('signOut', () => {
    it('should call trackAuthEvent logout and supabase signOut', async () => {
      // Arrange
      mockSupabaseAuth.signOut.mockResolvedValue({ error: null } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.signOut();
      });

      // Assert
      expect(trackAuthEvent).toHaveBeenCalledWith('logout');
      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
    });
  });

  describe('role exposure', () => {
    it('should expose role properties from useRole hook', () => {
      // Arrange
      (useRole as jest.Mock).mockReturnValue({
        role: 'admin',
        isAdmin: true,
        isPremium: true,
        loading: false,
        error: null,
      });

      // Act
      const { result } = renderHook(() => useAuth());

      // Assert
      expect(result.current.role).toBe('admin');
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isPremium).toBe(true);
    });
  });
});
