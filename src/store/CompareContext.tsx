import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import type { MovieShort } from '../types/movie'

interface CompareContextValue {
  items: MovieShort[]
  toggleItem: (movie: MovieShort) => void
  isInCompare: (id: number) => boolean
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined)

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<MovieShort[]>([])

  const toggleItem = (movie: MovieShort) => {
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
  }

  const value = useMemo(
    () => ({
      items,
      toggleItem,
      isInCompare: (id: number) => items.some((m) => m.id === id),
    }),
    [items],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export const useCompare = () => {
  const ctx = useContext(CompareContext)
  if (!ctx) {
    throw new Error('useCompare must be used within CompareProvider')
  }
  return ctx
}

