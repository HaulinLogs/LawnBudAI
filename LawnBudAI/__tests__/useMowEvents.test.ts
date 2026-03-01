import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useMowEvents } from '@/hooks/useMowEvents';
import { MowEventInput } from '@/models/events';
import { supabase } from '@/lib/supabase';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock useSupabaseUser (also mocked globally in setup.ts — override per test)
jest.mock('@/hooks/useSupabaseUser');

describe('useMowEvents', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockEvents = [
    {
      id: '1',
      user_id: 'user-123',
      date: '2026-02-15',
      height_inches: 2.5,
      notes: 'Spring cut',
      created_at: '2026-02-15T10:00:00Z',
      updated_at: '2026-02-15T10:00:00Z',
    },
    {
      id: '2',
      user_id: 'user-123',
      date: '2026-02-01',
      height_inches: 3.0,
      notes: null,
      created_at: '2026-02-01T10:00:00Z',
      updated_at: '2026-02-01T10:00:00Z',
    },
    {
      id: '3',
      user_id: 'user-123',
      date: '2026-01-15',
      height_inches: 2.0,
      notes: 'Low cut before winter',
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-01-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchEvents', () => {
    it('should fetch mowing events for authenticated user', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockEvents,
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      // Act
      const { result } = renderHook(() => useMowEvents());

      // Assert — initial loading state
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toEqual(mockEvents);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('DB connection failed'),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      // Act
      const { result } = renderHook(() => useMowEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.error).toBeTruthy();
      expect(result.current.events).toEqual([]);
    });

    it('should set error when user is not authenticated', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
        error: null,
      });

      // Act
      const { result } = renderHook(() => useMowEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.error).toBeTruthy();
      expect(result.current.events).toEqual([]);
    });

    it('should not fetch when userLoading is true', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: null,
        loading: true,
        error: null,
      });

      // Act
      renderHook(() => useMowEvents());

      // Assert — supabase.from should not be called while auth is still loading
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('addEvent', () => {
    it('should add a new mowing event and prepend to events list', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      const newEvent = {
        id: '4',
        user_id: 'user-123',
        date: '2026-03-01',
        height_inches: 2.5,
        notes: null,
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: newEvent,
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
        insert: mockInsert,
      });

      const { result } = renderHook(() => useMowEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const input: MowEventInput = {
        date: '2026-03-01',
        height_inches: 2.5,
      };

      await act(async () => {
        await result.current.addEvent(input);
      });

      // Assert
      expect(result.current.events).toContainEqual(newEvent);
    });

    it('should throw and set error on insert failure', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Insert failed'),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
        insert: mockInsert,
      });

      const { result } = renderHook(() => useMowEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act & Assert
      const input: MowEventInput = {
        date: '2026-03-01',
        height_inches: 2.5,
      };

      await expect(result.current.addEvent(input)).rejects.toThrow();
    });
  });

  describe('deleteEvent', () => {
    it('should remove event from local state after successful delete', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockEvents,
                error: null,
              }),
            }),
          }),
        }),
        delete: mockDelete,
      });

      const { result } = renderHook(() => useMowEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.events.length;

      // Act
      await act(async () => {
        await result.current.deleteEvent('1');
      });

      // Assert
      expect(result.current.events.length).toBe(initialCount - 1);
      expect(result.current.events.find(e => e.id === '1')).toBeUndefined();
    });

    it('should throw on delete failure', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: new Error('Delete failed'),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockEvents,
                error: null,
              }),
            }),
          }),
        }),
        delete: mockDelete,
      });

      const { result } = renderHook(() => useMowEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act & Assert
      await expect(result.current.deleteEvent('1')).rejects.toThrow();
    });
  });

  describe('getStats', () => {
    it('should return null values when no events exist', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMowEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const stats = result.current.getStats();

      // Assert
      expect(stats.lastMowedDaysAgo).toBeNull();
      expect(stats.averageHeight).toBeNull();
    });

    it('should calculate lastMowedDaysAgo and averageHeight with events', async () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockEvents,
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMowEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const stats = result.current.getStats();

      // Assert
      expect(stats.lastMowedDaysAgo).toBeDefined();
      expect(typeof stats.lastMowedDaysAgo).toBe('number');
      expect(stats.lastMowedDaysAgo).toBeGreaterThanOrEqual(0);
      expect(stats.averageHeight).toBeDefined();
    });

    it('should average height from up to 3 most recent events', async () => {
      // Arrange — 3 events with heights 2.5, 3.0, 2.0 → avg = 2.5 → '2.50'
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: mockUser,
        loading: false,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockEvents,
                error: null,
              }),
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useMowEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const stats = result.current.getStats();

      // Assert — (2.5 + 3.0 + 2.0) / 3 = 2.5 → formatted as '2.50'
      expect(stats.averageHeight).toBe('2.50');
    });
  });
});
