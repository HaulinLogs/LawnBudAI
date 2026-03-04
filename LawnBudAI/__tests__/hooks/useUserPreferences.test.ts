import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { supabase } from '@/lib/supabase';

// useSupabaseUser is already globally mocked in setup.ts
// We control its return value per-test via mockReturnValue.

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const mockUser = { id: 'user-123', email: 'test@example.com' };

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useUserPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPreferences', () => {
    it('should set prefs from database when a row is found', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      const dbPrefs = {
        city: 'Chicago',
        state: 'IL',
        timezone: 'America/Chicago',
        grass_type: 'warm_season',
        lawn_size_sqft: 2500,
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: dbPrefs,
              error: null,
            }),
          }),
        }),
      });

      // Act
      const { result } = renderHook(() => useUserPreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.prefs.city).toBe('Chicago');
      expect(result.current.prefs.state).toBe('IL');
      expect(result.current.prefs.grass_type).toBe('warm_season');
      expect(result.current.prefs.lawn_size_sqft).toBe(2500);
    });

    it('should use default values when database fields are null/missing', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                city: null,
                state: null,
                timezone: null,
                grass_type: null,
                lawn_size_sqft: null,
              },
              error: null,
            }),
          }),
        }),
      });

      // Act
      const { result } = renderHook(() => useUserPreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert: falls back to defaults when DB columns are null
      expect(result.current.prefs.city).toBe('Madison');
      expect(result.current.prefs.state).toBe('WI');
      expect(result.current.prefs.grass_type).toBe('cool_season');
    });

    it('should auto-create default preferences when no row exists', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      const mockInsert = jest.fn().mockResolvedValue({ error: null });

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null, // no row found
              error: null,
            }),
          }),
        }),
        insert: mockInsert,
      });

      // Act
      const { result } = renderHook(() => useUserPreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert: insert was called to create defaults
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
          city: 'Madison',
          state: 'WI',
        }),
      );

      // Prefs should remain at defaults
      expect(result.current.prefs.city).toBe('Madison');
    });

    it('should set loading to false without fetching when user is null', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
        error: null,
      });

      // Act
      const { result } = renderHook(() => useUserPreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert: no supabase call was made
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should skip fetch while userLoading is true', async () => {
      // Arrange: user is still loading
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: null,
        loading: true,
        error: null,
      });

      // Act
      const { result } = renderHook(() => useUserPreferences());

      // loading remains true (useEffect returns early without calling setLoading(false))
      expect(result.current.loading).toBe(true);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should use defaults and not attempt insert when supabase returns a fetch error', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      const mockInsert = jest.fn();

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('DB error'),
            }),
          }),
        }),
        insert: mockInsert,
      });

      // Act
      const { result } = renderHook(() => useUserPreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert: prefs stay at defaults, hook does not throw, and no insert is
      // attempted (we can't know if a row exists when the fetch itself failed)
      expect(result.current.prefs.city).toBe('Madison');
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('should call supabase upsert with updates and update local prefs', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      const mockUpsert = jest.fn().mockResolvedValue({ error: null });

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({ error: null }),
        upsert: mockUpsert,
      });

      const { result } = renderHook(() => useUserPreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.save({ city: 'Denver', state: 'CO' });
      });

      // Assert
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
          city: 'Denver',
          state: 'CO',
        }),
        { onConflict: 'user_id' },
      );
      expect(result.current.prefs.city).toBe('Denver');
      expect(result.current.prefs.state).toBe('CO');
    });

    it('should return early when no user is authenticated', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
        error: null,
      });

      const mockUpsert = jest.fn();

      (mockSupabase.from as jest.Mock).mockReturnValue({
        upsert: mockUpsert,
      });

      const { result } = renderHook(() => useUserPreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.save({ city: 'Denver' });
      });

      // Assert: upsert never called when no user
      expect(mockUpsert).not.toHaveBeenCalled();
    });

    it('should throw when supabase upsert returns an error', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      const upsertError = new Error('Upsert failed');
      const mockUpsert = jest.fn().mockResolvedValue({ error: upsertError });

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({ error: null }),
        upsert: mockUpsert,
      });

      const { result } = renderHook(() => useUserPreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.save({ city: 'Denver' });
        }),
      ).rejects.toThrow();
    });
  });
});
