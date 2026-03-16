/**
 * Tests for the useSoilTemp hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useSoilTemp } from '@/hooks/useSoilTemp';

// global.fetch is already mocked to jest.fn() in setup.ts
const mockFetch = global.fetch as jest.Mock;

function buildValidOpenMeteoResponse() {
  const times: string[] = [];
  const temps: number[] = [];
  const base = new Date('2026-09-01T00:00:00');
  for (let h = 0; h < 24; h++) {
    const t = new Date(base);
    t.setHours(h);
    times.push(t.toISOString().slice(0, 16));
    temps.push(15); // 15°C = 59°F
  }
  return {
    hourly: {
      time: times,
      soil_temperature_0cm: temps,
      soil_temperature_6cm: temps,
    },
  };
}

describe('useSoilTemp', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('starts in loading state when city and state are provided', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useSoilTemp('Madison', 'WI'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('resolves to data on successful fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => buildValidOpenMeteoResponse(),
    });

    const { result } = renderHook(() => useSoilTemp('Madison', 'WI'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.data!.currentTempF).toBe(59); // 15°C → 59°F
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useSoilTemp('Madison', 'WI'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.data).toBeNull();
  });

  it('does not fetch when city is empty', () => {
    const { result } = renderHook(() => useSoilTemp('', 'WI'));
    expect(result.current.loading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not fetch when state is empty', () => {
    const { result } = renderHook(() => useSoilTemp('Madison', ''));
    expect(result.current.loading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sets error when fetch throws (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

    const { result } = renderHook(() => useSoilTemp('Madison', 'WI'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('Network request failed');
    expect(result.current.data).toBeNull();
  });

  it('falls back to default message when non-Error is thrown', async () => {
    mockFetch.mockRejectedValueOnce('plain string rejection');

    const { result } = renderHook(() => useSoilTemp('Madison', 'WI'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch soil temperature');
    expect(result.current.data).toBeNull();
  });

  it('does not update state after unmount (cancelled path)', async () => {
    let settle!: () => void;
    mockFetch.mockReturnValueOnce(
      new Promise<any>((resolve) => {
        settle = () =>
          resolve({ ok: true, json: async () => buildValidOpenMeteoResponse() });
      }),
    );

    const { result, unmount } = renderHook(() => useSoilTemp('Madison', 'WI'));
    expect(result.current.loading).toBe(true);

    unmount();
    settle(); // resolve after unmount — should not throw or update state
  });
});
