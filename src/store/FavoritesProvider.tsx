import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { MovieShort } from '../types/movie'
import { FavoritesContext } from './FavoritesContext'

const STORAGE_KEY = 'movie-explorer:favorites'

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

