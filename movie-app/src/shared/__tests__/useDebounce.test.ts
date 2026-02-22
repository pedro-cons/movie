import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('returns the initial value immediately without waiting', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));

    expect(result.current).toBe('hello');
  });

  it('does not update the value before the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } },
    );

    rerender({ value: 'updated', delay: 300 });

    // Advance time by less than the delay
    act(() => {
      jest.advanceTimersByTime(299);
    });

    expect(result.current).toBe('initial');
  });

  it('returns the updated value after the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } },
    );

    rerender({ value: 'updated', delay: 300 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('resets the timer when value changes before delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    );

    rerender({ value: 'b', delay: 300 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Change value again before previous timer fires
    rerender({ value: 'c', delay: 300 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Total time elapsed is 400ms, but the second timer has only had 200ms
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Now 300ms have passed since the last update
    expect(result.current).toBe('c');
  });

  it('uses the provided custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'start', delay: 500 } },
    );

    rerender({ value: 'end', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe('start');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('end');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 1, delay: 300 } },
    );

    rerender({ value: 99, delay: 300 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe(99);
  });

  it('defaults delay to 300ms when not provided', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'first' } },
    );

    rerender({ value: 'second' });

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe('first');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('second');
  });
});
