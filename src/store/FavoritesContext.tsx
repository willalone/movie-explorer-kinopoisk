import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { MovieShort } from '../types/movie'

const STORAGE_KEY = 'movie-explorer:favorites'

interface FavoritesContextValue {
  favorites: MovieShort[]
  add: (movie: MovieShort) => void
  remove: (id: number) => void
  isFavorite: (id: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

const loadInitial = (): MovieShort[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as MovieShort[]
  } catch {
    return []
  }
}

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<MovieShort[]>(loadInitial)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const value = useMemo(
    () => ({
      favorites,
      add: (movie: MovieShort) =>
        setFavorites((prev) => (prev.some((m) => m.id === movie.id) ? prev : [...prev, movie])),
      remove: (id: number) => setFavorites((prev) => prev.filter((m) => m.id !== id)),
      isFavorite: (id: number) => favorites.some((m) => m.id === id),
    }),
    [favorites],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return ctx
}

