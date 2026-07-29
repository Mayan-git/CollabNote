import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('delays invocation until after the wait time', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => result.current('a'));
    expect(callback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(500));
    expect(callback).toHaveBeenCalledWith('a');
  });

  it('cancels the previous call when invoked again before the delay elapses', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => result.current('first'));
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current('second'));
    act(() => vi.advanceTimersByTime(500));

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('second');
  });
});
