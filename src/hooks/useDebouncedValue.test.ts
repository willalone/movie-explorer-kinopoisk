import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 200))
    expect(result.current).toBe('hello')
  })

  it('updates value after delay', async () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebouncedValue(value, delay),
      {
        initialProps: { value: 'a', delay: 200 },
      },
    )

    expect(result.current).toBe('a')

    rerender({ value: 'b', delay: 200 })

    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('b')

    vi.useRealTimers()
  })
})

