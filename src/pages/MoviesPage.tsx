import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchMovies } from '../api/movies'
import type { MovieShort } from '../types/movie'
import { MovieCard } from '../components/MovieCard'
import { InfiniteScroller } from '../components/InfiniteScroller'
import { MoviesFilters } from '../components/MoviesFilters'
import type { MoviesFiltersValue } from '../components/MoviesFilters'
import { useFavorites } from '../store/FavoritesContext'
import { ConfirmModal } from '../components/ConfirmModal'
import axios from 'axios'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { MovieCardSkeleton } from '../components/MovieCardSkeleton'

const PAGE_SIZE = 50

export const MoviesPage = () => {
  const [filters, setFilters] = useState<MoviesFiltersValue>({
    genres: [],
    ratingFrom: 0,
    ratingTo: 10,
    yearFrom: 1990,
    yearTo: new Date().getFullYear(),
  })
  const [movies, setMovies] = useState<MovieShort[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingFavorite, setPendingFavorite] = useState<MovieShort | null>(null)

  const { add: addFavorite, remove: removeFavorite } = useFavorites()
  const debouncedFilters = useDebouncedValue(filters, 350)
  const abortRef = useRef<AbortController | null>(null)

  const loadPage = useCallback(
    async (pageToLoad: number, replace = false) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      try {
        setError(null)
        const response = await fetchMovies({
          page: pageToLoad,
          limit: PAGE_SIZE,
          genres: debouncedFilters.genres,
          ratingFrom: debouncedFilters.ratingFrom,
          ratingTo: debouncedFilters.ratingTo,
          yearFrom: debouncedFilters.yearFrom,
          yearTo: debouncedFilters.yearTo,
        }, { signal: controller.signal })

        setHasMore(pageToLoad < response.pages)
        setPage(pageToLoad)
        setMovies((prev) => (replace ? response.docs : [...prev, ...response.docs]))
      } catch (e) {
        if (axios.isAxiosError(e) && (e.code === 'ERR_CANCELED' || e.name === 'CanceledError')) {
          return
        }
        if (axios.isAxiosError(e)) {
          const status = e.response?.status
          const apiMessage =
            typeof e.response?.data === 'string'
              ? e.response.data
              : (e.response?.data as { message?: string } | undefined)?.message
          setError(
            `Не удалось загрузить фильмы.${status ? ` (${status})` : ''}${apiMessage ? ` ${apiMessage}` : ''}`,
          )
        } else {
          setError('Не удалось загрузить фильмы. Попробуйте обновить страницу.')
        }
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    },
    [debouncedFilters],
  )

  useEffect(() => {
    void loadPage(1, true)
    return () => abortRef.current?.abort()
  }, [debouncedFilters, loadPage])

  const handleReachEnd = () => {
    if (!loading && hasMore) {
      void loadPage(page + 1)
    }
  }

  const totalLoaded = useMemo(() => movies.length, [movies.length])
  const isInitialLoading = loading && movies.length === 0

  return (
    <div className="page page--movies">
      <MoviesFilters value={filters} onChange={setFilters} />

      <section className="movies-list">
        <div className="movies-list__header">
          <h1>Популярные фильмы</h1>
          <span className="movies-list__counter">{totalLoaded} фильмов загружено</span>
        </div>

        {error && (
          <div className="alert alert--error">
            <div className="alert__content">{error}</div>
            <div className="alert__actions">
              <button type="button" className="btn btn--secondary" onClick={() => void loadPage(1, true)}>
                Повторить
              </button>
            </div>
          </div>
        )}

        <InfiniteScroller disabled={loading || !hasMore || Boolean(error)} onReachEnd={handleReachEnd}>
          <div className="movies-grid">
            {isInitialLoading
              ? Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
              : movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onRequestAddToFavorites={setPendingFavorite}
                    onRequestRemoveFromFavorites={(m) => removeFavorite(m.id)}
                  />
                ))}
          </div>
          {loading && <div className="movies-list__loader">Загрузка...</div>}
          {!loading && !movies.length && <div className="movies-list__empty">Нет фильмов по заданным фильтрам</div>}
        </InfiniteScroller>
      </section>

      <ConfirmModal
        open={Boolean(pendingFavorite)}
        title="Добавить фильм в избранное?"
        description={pendingFavorite ? pendingFavorite.name : undefined}
        confirmLabel="Добавить"
        cancelLabel="Отмена"
        onClose={() => setPendingFavorite(null)}
        onConfirm={() => {
          if (pendingFavorite) {
            addFavorite(pendingFavorite)
          }
        }}
      />
    </div>
  )
}

