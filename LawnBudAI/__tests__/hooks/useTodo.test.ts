/**
 * Tests for the useTodo hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useTodo } from '@/hooks/useTodo';

describe('useTodo', () => {
  it('returns advice for cool_season grass type', async () => {
    const { result } = renderHook(() => useTodo('cool_season'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.mowingTodo).not.toBeNull();
    expect(result.current.mowingTodo!.name).toBe('Mowing');
    expect(result.current.wateringTodo).not.toBeNull();
    expect(result.current.wateringTodo!.name).toBe('Watering');
    expect(result.current.fertilizerTodo).not.toBeNull();
    expect(result.current.fertilizerTodo!.name).toBe('Fertilizing');
  });

  it('returns advice for warm_season grass type', async () => {
    const { result } = renderHook(() => useTodo('warm_season'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.mowingTodo).not.toBeNull();
    expect(result.current.wateringTodo).not.toBeNull();
    expect(result.current.fertilizerTodo).not.toBeNull();
  });

  it('returns advice for mixed grass type', async () => {
    const { result } = renderHook(() => useTodo('mixed'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.mowingTodo).not.toBeNull();
    expect(result.current.wateringTodo).not.toBeNull();
    expect(result.current.fertilizerTodo).not.toBeNull();
  });

  it('defaults to cool_season when no grass type is provided', async () => {
    const { result } = renderHook(() => useTodo());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.mowingTodo).not.toBeNull();
  });

  it('returns overseeding reminder during the overseeding window (August)', async () => {
    // useTodo calls new Date() internally — inject August date via fake timers
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-15T12:00:00Z'));

    const { result } = renderHook(() => useTodo('cool_season'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // August is in the "now" window for cool_season
    expect(result.current.overseedingReminder).not.toBeNull();
    expect(result.current.overseedingReminder!.urgency).toBe('now');

    jest.useRealTimers();
  });

  it('returns null overseedingReminder outside overseeding season (March)', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-15T12:00:00Z'));

    const { result } = renderHook(() => useTodo('cool_season'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.overseedingReminder).toBeNull();

    jest.useRealTimers();
  });
});
