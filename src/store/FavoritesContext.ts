import type { MovieShort } from '../types/movie'
import { createContext } from 'react'

export interface FavoritesContextValue {
  favorites: MovieShort[]
  add: (movie: MovieShort) => void
  remove: (id: number) => void
  isFavorite: (id: number) => boolean
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

