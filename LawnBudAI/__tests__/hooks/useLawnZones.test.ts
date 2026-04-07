/**
 * Tests for the useLawnZones hook (TDD)
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { supabase } from '@/lib/supabase';
import { useLawnZones } from '@/hooks/useLawnZones';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('@/hooks/useSupabaseUser', () => ({
  useSupabaseUser: jest.fn(),
}));

const mockUseSupabaseUser = useSupabaseUser as jest.Mock;
const mockSupabaseFrom = supabase.from as jest.Mock;

const mockUser = { id: 'user-test-123', email: 'test@example.com' };

const mockZone = {
  id: 'zone-001',
  user_id: 'user-test-123',
  name: 'Front Yard',
  size_sqft: 1000,
  notes: null,
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-01T10:00:00Z',
};

const mockZone2 = {
  id: 'zone-002',
  user_id: 'user-test-123',
  name: 'Back Yard',
  size_sqft: 2000,
  notes: 'Shaded area',
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-01T10:00:00Z',
};

function buildSelectChain(returnData: unknown[], error: unknown = null) {
  return {
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: returnData, error }),
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

function buildDeleteChain(error: unknown = null) {
  return {
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error }),
    }),
  };
}

describe('useLawnZones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSupabaseUser.mockReturnValue({ user: mockUser, loading: false, error: null });
  });

  describe('fetchZones', () => {
    it('fetches zones on mount when user is authenticated', async () => {
      mockSupabaseFrom.mockReturnValue(buildSelectChain([mockZone, mockZone2]));

      const { result } = renderHook(() => useLawnZones());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.zones).toHaveLength(2);
      expect(result.current.zones[0].id).toBe('zone-001');
      expect(result.current.zones[1].id).toBe('zone-002');
      expect(result.current.error).toBeNull();
    });

    it('returns empty zones array when no zones exist', async () => {
      mockSupabaseFrom.mockReturnValue(buildSelectChain([]));

      const { result } = renderHook(() => useLawnZones());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.zones).toHaveLength(0);
    });

    it('sets error when not authenticated', async () => {
      mockUseSupabaseUser.mockReturnValue({ user: null, loading: false, error: null });

      const { result } = renderHook(() => useLawnZones());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Not authenticated');
    });

    it('stays loading while user auth state is loading', () => {
      mockUseSupabaseUser.mockReturnValue({ user: null, loading: true, error: null });

      const { result } = renderHook(() => useLawnZones());

      expect(result.current.loading).toBe(true);
    });

    it('sets error state when fetch fails', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      });

      const { result } = renderHook(() => useLawnZones());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('DB error');
    });
  });

  describe('addZone', () => {
    it('adds a zone and prepends it to local state', async () => {
      mockSupabaseFrom
        .mockReturnValueOnce(buildSelectChain([]))
        .mockReturnValueOnce(buildInsertChain(mockZone));

      const { result } = renderHook(() => useLawnZones());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.addZone({
          name: 'Front Yard',
          size_sqft: 1000,
        });
      });

      expect(result.current.zones).toHaveLength(1);
      expect(result.current.zones[0].name).toBe('Front Yard');
    });

    it('throws when not authenticated', async () => {
      mockUseSupabaseUser.mockReturnValue({ user: null, loading: false, error: null });
      mockSupabaseFrom.mockReturnValue(buildSelectChain([]));

      const { result } = renderHook(() => useLawnZones());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await expect(
        act(async () => {
          await result.current.addZone({ name: 'Front Yard' });
        }),
      ).rejects.toThrow('Not authenticated');
    });

    it('throws and sets error when insert fails', async () => {
      mockSupabaseFrom
        .mockReturnValueOnce(buildSelectChain([]))
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
            }),
          }),
        });

      const { result } = renderHook(() => useLawnZones());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        try {
          await result.current.addZone({ name: 'Front Yard' });
        } catch {
          // expected to throw
        }
      });

      expect(result.current.error).toBe('Insert failed');
    });
  });

  describe('deleteZone', () => {
    it('removes the zone from local state after deletion', async () => {
      mockSupabaseFrom
        .mockReturnValueOnce(buildSelectChain([mockZone, mockZone2]))
        .mockReturnValueOnce(buildDeleteChain(null));

      const { result } = renderHook(() => useLawnZones());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.zones).toHaveLength(2);

      await act(async () => {
        await result.current.deleteZone('zone-001');
      });

      expect(result.current.zones).toHaveLength(1);
      expect(result.current.zones[0].id).toBe('zone-002');
    });

    it('throws and sets error when delete fails', async () => {
      mockSupabaseFrom
        .mockReturnValueOnce(buildSelectChain([mockZone]))
        .mockReturnValueOnce(buildDeleteChain({ message: 'Delete failed' }));

      const { result } = renderHook(() => useLawnZones());
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        try {
          await result.current.deleteZone('zone-001');
        } catch {
          // expected to throw
        }
      });

      expect(result.current.error).toBe('Delete failed');
    });
  });

  describe('totalLawnSize', () => {
    it('returns sum of all zone sizes', async () => {
      mockSupabaseFrom.mockReturnValue(buildSelectChain([mockZone, mockZone2]));

      const { result } = renderHook(() => useLawnZones());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.totalLawnSize).toBe(3000);
    });

    it('returns 0 when no zones exist', async () => {
      mockSupabaseFrom.mockReturnValue(buildSelectChain([]));

      const { result } = renderHook(() => useLawnZones());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.totalLawnSize).toBe(0);
    });

    it('ignores zones without size_sqft', async () => {
      const zoneNoSize = { ...mockZone, size_sqft: null };
      mockSupabaseFrom.mockReturnValue(buildSelectChain([zoneNoSize, mockZone2]));

      const { result } = renderHook(() => useLawnZones());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.totalLawnSize).toBe(2000);
    });
  });
});
