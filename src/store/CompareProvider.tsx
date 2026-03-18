import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type { MovieShort } from '../types/movie'
import { CompareContext } from './CompareContext'

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<MovieShort[]>([])

  const toggleItem = useCallback((movie: MovieShort) => {
    setItems((prev) => {
      const exists = prev.find((m) => m.id === movie.id)
      if (exists) {
        return prev.filter((m) => m.id !== movie.id)
      }
      if (prev.length >= 2) {
        return [prev[1], movie]
      }
      return [...prev, movie]
    })
  }, [])

  const value = useMemo(
    () => ({
      items,
      toggleItem,
      isInCompare: (id: number) => items.some((m) => m.id === id),
    }),
    [items, toggleItem],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

