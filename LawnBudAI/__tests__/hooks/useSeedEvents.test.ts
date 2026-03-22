/**
 * Tests for the useSeedEvents hook
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { supabase } from '@/lib/supabase';
import { useSeedEvents } from '@/hooks/useSeedEvents';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

// Mock supabase before the hook imports it (babel-jest hoists jest.mock calls)
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Override the global setup.ts mock to return an authenticated user by default
jest.mock('@/hooks/useSupabaseUser', () => ({
  useSupabaseUser: jest.fn(),
}));

const mockUseSupabaseUser = useSupabaseUser as jest.Mock;
const mockSupabaseFrom = supabase.from as jest.Mock;

const mockUser = { id: 'user-test-123', email: 'test@example.com' };

const mockSeedEvent = {
  id: 'evt-001',
  user_id: 'user-test-123',
  date: '2026-09-01',
  grass_seed_type: 'tall_fescue',
  area_sqft: null,
  notes: null,
  created_at: '2026-09-01T10:00:00Z',
  updated_at: '2026-09-01T10:00:00Z',
};

function buildSelectChain(returnData: unknown[], error: unknown = null) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data: returnData, error }),
        }),
      }),
    }),
  };
}

function buildInsertChain(returnData: unknown, error: unknown = null) {
  return {
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: returnData, error }),
      }),
    }),
  };
}

describe('useSeedEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSupabaseUser.mockReturnValue({ user: mockUser, loading: false, error: null });
  });

  describe('fetchEvents', () => {
    it('fetches seed events on mount when user is authenticated', async () => {
      mockSupabaseFrom.mockReturnValue(buildSelectChain([mockSeedEvent]));

      const { result } = renderHook(() => useSeedEvents());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0].id).toBe('evt-001');
      expect(result.current.error).toBeNull();
    });

    it('exposes latestEvent as the most recent seed event', async () => {
      mockSupabaseFrom.mockReturnValue(buildSelectChain([mockSeedEvent]));

      const { result } = renderHook(() => useSeedEvents());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.latestEvent).toEqual(mockSeedEvent);
    });

    it('sets latestEvent to null when no events exist', async () => {
      mockSupabaseFrom.mockReturnValue(buildSelectChain([]));

      const { result } = renderHook(() => useSeedEvents());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.latestEvent).toBeNull();
      expect(result.current.daysSinceLastSeed).toBeNull();
    });

    it('computes daysSinceLastSeed correctly', async () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3);
      const dateStr = threeDaysAgo.toISOString().split('T')[0];

      mockSupabaseFrom.mockReturnValue(
        buildSelectChain([{ ...mockSeedEvent, date: dateStr }]),
      );

      const { result } = renderHook(() => useSeedEvents());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.daysSinceLastSeed).toBe(3);
    });

    it('sets error when not authenticated', async () => {
      mockUseSupabaseUser.mockReturnValue({ user: null, loading: false, error: null });

      const { result } = renderHook(() => useSeedEvents());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Not authenticated');
    });

    it('stays loading while user auth state is loading', () => {
      mockUseSupabaseUser.mockReturnValue({ user: null, loading: true, error: null });

      const { result } = renderHook(() => useSeedEvents());

      expect(result.current.loading).toBe(true);
    });
  });

  describe('addEvent', () => {
    it('adds a seed event and prepends it to local state', async () => {
      mockSupabaseFrom
        .mockReturnValueOnce(buildSelectChain([]))
        .mockReturnValueOnce(buildInsertChain(mockSeedEvent));

      const { result } = renderHook(() => useSeedEvents());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addEvent({
          date: '2026-09-01',
          grass_seed_type: 'tall_fescue',
        });
      });

      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0].id).toBe('evt-001');
    });

    it('throws when not authenticated', async () => {
      mockUseSupabaseUser.mockReturnValue({ user: null, loading: false, error: null });
      mockSupabaseFrom.mockReturnValue(buildSelectChain([]));

      const { result } = renderHook(() => useSeedEvents());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(
        act(async () => {
          await result.current.addEvent({ date: '2026-09-01', grass_seed_type: 'mixed' });
        }),
      ).rejects.toThrow('Not authenticated');
    });
  });

  describe('deleteEvent', () => {
    it('removes the event from local state after deletion', async () => {
      mockSupabaseFrom
        .mockReturnValueOnce(buildSelectChain([mockSeedEvent]))
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        });

      const { result } = renderHook(() => useSeedEvents());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.events).toHaveLength(1);

      await act(async () => {
        await result.current.deleteEvent('evt-001');
      });

      expect(result.current.events).toHaveLength(0);
    });
  });
});
