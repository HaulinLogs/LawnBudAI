import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useFertilizerEvents } from '@/hooks/useFertilizerEvents';
import { FertilizerEventInput } from '@/models/events';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('useFertilizerEvents', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockEvents = [
    {
      id: '1',
      user_id: 'user-123',
      date: '2026-02-15',
      type: 'nitrogen' as const,
      amount_lbs: 10.5,
      notes: 'Spring nitrogen application',
      created_at: '2026-02-15T10:00:00Z',
      updated_at: '2026-02-15T10:00:00Z',
    },
    {
      id: '2',
      user_id: 'user-123',
      date: '2026-02-01',
      type: 'balanced' as const,
      amount_lbs: 15.0,
      notes: 'General maintenance',
      created_at: '2026-02-01T10:00:00Z',
      updated_at: '2026-02-01T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchEvents', () => {
    it('should fetch fertilizer events from Supabase', async () => {
      // Arrange
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
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
      const { result } = renderHook(() => useFertilizerEvents());

      // Assert - initial state
      expect(result.current.loading).toBe(true);

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toEqual(mockEvents);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Failed to fetch events';
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: new Error(errorMessage),
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      // Act
      const { result } = renderHook(() => useFertilizerEvents());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.events).toEqual([]);
    });

    it('should handle unauthenticated user', async () => {
      // Arrange
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      // Act
      const { result } = renderHook(() => useFertilizerEvents());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.events).toEqual([]);
    });
  });

  describe('addEvent', () => {
    it('should add a new fertilizer event', async () => {
      // Arrange
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const newEvent = mockEvents[0];
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

      const { result } = renderHook(() => useFertilizerEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const input: FertilizerEventInput = {
        date: '2026-02-15',
        type: 'nitrogen',
        amount_lbs: 10.5,
        notes: 'Spring nitrogen application',
      };

      await act(async () => {
        await result.current.addEvent(input);
      });

      // Assert
      expect(result.current.events).toContainEqual(newEvent);
    });

    it('should handle add event errors', async () => {
      // Arrange
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const errorMessage = 'Insert failed';
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error(errorMessage),
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

      const { result } = renderHook(() => useFertilizerEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act & Assert
      const input: FertilizerEventInput = {
        date: '2026-02-15',
        type: 'nitrogen',
        amount_lbs: 10.5,
      };

      await expect(result.current.addEvent(input)).rejects.toThrow();
    });
  });

  describe('deleteEvent', () => {
    it('should delete a fertilizer event', async () => {
      // Arrange
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
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

      const { result } = renderHook(() => useFertilizerEvents());

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
      expect(result.current.events.some((e) => e.id === '1')).toBe(false);
    });

    it('should handle delete errors', async () => {
      // Arrange
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const errorMessage = 'Delete failed';
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: new Error(errorMessage),
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

      const { result } = renderHook(() => useFertilizerEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act & Assert
      await expect(result.current.deleteEvent('1')).rejects.toThrow();
    });
  });

  describe('getStats', () => {
    it('should calculate last application days ago', async () => {
      // Arrange
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
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

      const { result } = renderHook(() => useFertilizerEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const stats = result.current.getStats();

      // Assert
      expect(stats.lastApplicationDaysAgo).toBeDefined();
      expect(stats.lastApplicationDaysAgo).toBeGreaterThanOrEqual(0);
      expect(typeof stats.lastApplicationDaysAgo).toBe('number');
    });

    it('should calculate total pounds applied', async () => {
      // Arrange
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
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

      const { result } = renderHook(() => useFertilizerEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const stats = result.current.getStats();

      // Assert
      const expectedTotal = mockEvents.reduce((sum, e) => sum + e.amount_lbs, 0);
      expect(stats.totalPoundsApplied).toBe(expectedTotal.toFixed(1));
    });

    it('should calculate type breakdown', async () => {
      // Arrange
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
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

      const { result } = renderHook(() => useFertilizerEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const breakdown = result.current.getTypeBreakdown();

      // Assert
      expect(breakdown).toHaveProperty('nitrogen');
      expect(breakdown).toHaveProperty('phosphorus');
      expect(breakdown).toHaveProperty('potassium');
      expect(breakdown).toHaveProperty('balanced');
      expect(breakdown.nitrogen).toBe(1);
      expect(breakdown.balanced).toBe(1);
    });

    it('should return null stats when no events exist', async () => {
      // Arrange
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
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

      const { result } = renderHook(() => useFertilizerEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      const stats = result.current.getStats();

      // Assert
      expect(stats.lastApplicationDaysAgo).toBeNull();
      expect(stats.totalPoundsApplied).toBe('0');
      expect(stats.averagePoundsPerApplication).toBeNull();
    });
  });
});
