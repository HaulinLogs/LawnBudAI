import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useWaterEvents } from '@/hooks/useWaterEvents';
import { WaterEventInput } from '@/models/events';
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

describe('useWaterEvents', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockEvents = [
    {
      id: '1',
      user_id: 'user-123',
      date: '2026-02-15',
      amount_inches: 0.5,
      source: 'sprinkler' as const,
      notes: 'Morning run',
      created_at: '2026-02-15T10:00:00Z',
      updated_at: '2026-02-15T10:00:00Z',
    },
    {
      id: '2',
      user_id: 'user-123',
      date: '2026-02-01',
      amount_inches: 1.0,
      source: 'rain' as const,
      notes: null,
      created_at: '2026-02-01T10:00:00Z',
      updated_at: '2026-02-01T10:00:00Z',
    },
    {
      id: '3',
      user_id: 'user-123',
      date: '2026-01-20',
      amount_inches: 0.25,
      source: 'manual' as const,
      notes: 'Hand watering',
      created_at: '2026-01-20T10:00:00Z',
      updated_at: '2026-01-20T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchEvents', () => {
    it('should fetch watering events for authenticated user', async () => {
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
      const { result } = renderHook(() => useWaterEvents());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
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
      const { result } = renderHook(() => useWaterEvents());

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
      const { result } = renderHook(() => useWaterEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.error).toBeTruthy();
      expect(result.current.events).toEqual([]);
    });

    it('should not fetch when userLoading is true', () => {
      // Arrange
      (useSupabaseUser as jest.Mock).mockReturnValue({
        user: null,
        loading: true,
        error: null,
      });

      // Act
      renderHook(() => useWaterEvents());

      // Assert
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('addEvent', () => {
    it('should add a new watering event and prepend to events list', async () => {
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
        amount_inches: 0.75,
        source: 'sprinkler' as const,
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

      const { result } = renderHook(() => useWaterEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const input: WaterEventInput = {
        date: '2026-03-01',
        amount_inches: 0.75,
        source: 'sprinkler',
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

      const { result } = renderHook(() => useWaterEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act & Assert
      const input: WaterEventInput = {
        date: '2026-03-01',
        amount_inches: 0.75,
        source: 'sprinkler',
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

      const { result } = renderHook(() => useWaterEvents());

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

      const { result } = renderHook(() => useWaterEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act & Assert
      await expect(result.current.deleteEvent('1')).rejects.toThrow();
    });
  });

  describe('getStats', () => {
    it('should return null/zero values when no events exist', async () => {
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

      const { result } = renderHook(() => useWaterEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const stats = result.current.getStats();

      // Assert — empty state returns null/zero values
      expect(stats.lastWateredDaysAgo).toBeNull();
      expect(stats.averageInchesPerWatering).toBeUndefined();
    });

    it('should calculate stats with events', async () => {
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

      const { result } = renderHook(() => useWaterEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const stats = result.current.getStats();

      // Assert
      expect(stats.lastWateredDaysAgo).toBeDefined();
      expect(typeof stats.lastWateredDaysAgo).toBe('number');
      expect(stats.lastWateredDaysAgo).toBeGreaterThanOrEqual(0);
      expect(stats.averageInchesPerWatering).toBeDefined();
    });
  });

  describe('getSourceBreakdown', () => {
    it('should count events by source type', async () => {
      // Arrange — mockEvents has 1 sprinkler, 1 rain, 1 manual
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

      const { result } = renderHook(() => useWaterEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const breakdown = result.current.getSourceBreakdown();

      // Assert
      expect(breakdown.sprinkler).toBe(1);
      expect(breakdown.rain).toBe(1);
      expect(breakdown.manual).toBe(1);
    });

    it('should return zeros when no events exist', async () => {
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

      const { result } = renderHook(() => useWaterEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const breakdown = result.current.getSourceBreakdown();

      // Assert
      expect(breakdown.sprinkler).toBe(0);
      expect(breakdown.rain).toBe(0);
      expect(breakdown.manual).toBe(0);
    });
  });
});
