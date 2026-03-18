import type { MovieShort } from '../types/movie'
import { createContext } from 'react'

export interface CompareContextValue {
  items: MovieShort[]
  toggleItem: (movie: MovieShort) => void
  isInCompare: (id: number) => boolean
}

export const CompareContext = createContext<CompareContextValue | undefined>(undefined)

