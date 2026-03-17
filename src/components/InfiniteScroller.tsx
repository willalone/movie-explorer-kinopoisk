import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

interface InfiniteScrollerProps {
  disabled?: boolean
  onReachEnd: () => void
  children: ReactNode
}

export const InfiniteScroller = ({ disabled, onReachEnd, children }: InfiniteScrollerProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disabled) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onReachEnd()
          }
        })
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [disabled, onReachEnd])

  return (
    <div className="infinite-scroller">
      {children}
      <div ref={sentinelRef} className="infinite-scroller__sentinel" />
    </div>
  )
}

