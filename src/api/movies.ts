import { apiClient } from './client'
import type { MovieDetails, MovieShort } from '../types/movie'

export interface MoviesFilter {
  page: number
  limit: number
  genres?: string[]
  ratingFrom?: number
  ratingTo?: number
  yearFrom?: number
  yearTo?: number
}

interface ApiMovie {
  id: number
  name: string
  year?: number
  rating?: {
    kp?: number
    imdb?: number
    tmdb?: number
  }
  genres?: { name: string }[]
  poster?: {
    url?: string
    previewUrl?: string
  }
  movieLength?: number
  description?: string
  alternativeName?: string
  slogan?: string
  premiere?: {
    world?: string
  }
}

interface ApiMoviesResponse {
  docs: ApiMovie[]
  total: number
  page: number
  pages: number
}

export interface MoviesResponse {
  docs: MovieShort[]
  total: number
  page: number
  pages: number
}

type CacheEntry<T> = { expiresAt: number; value: T }
const cache = new Map<string, CacheEntry<MoviesResponse>>()
const CACHE_TTL_MS = 5 * 60 * 1000

const makeCacheKey = (filter: MoviesFilter) =>
  JSON.stringify({
    page: filter.page,
    limit: filter.limit,
    genres: filter.genres ?? [],
    ratingFrom: filter.ratingFrom ?? 0,
    ratingTo: filter.ratingTo ?? 10,
    yearFrom: filter.yearFrom ?? 1990,
    yearTo: filter.yearTo ?? new Date().getFullYear(),
  })

const mapMovieFromApi = (movie: ApiMovie): MovieShort => ({
  id: movie.id,
  name: movie.name,
  year: movie.year,
  rating: movie.rating?.kp,
  alternativeName: movie.alternativeName,
  genres: movie.genres,
  poster: movie.poster,
  movieLength: movie.movieLength,
})

const mapMovieDetailsFromApi = (movie: ApiMovie): MovieDetails => ({
  ...mapMovieFromApi(movie),
  description: movie.description,
  slogan: movie.slogan,
  premiere: movie.premiere,
})

export const fetchMovies = async (
  filter: MoviesFilter,
  opts?: { signal?: AbortSignal },
): Promise<MoviesResponse> => {
  const cacheKey = makeCacheKey(filter)
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const params: Record<string, unknown> = {
    page: filter.page,
    limit: filter.limit,
    sortField: 'rating.kp',
    sortType: -1,
    'rating.kp': `${filter.ratingFrom ?? 0}-${filter.ratingTo ?? 10}`,
    year: `${filter.yearFrom ?? 1990}-${filter.yearTo ?? new Date().getFullYear()}`,
    type: 'movie',
  }

  if (filter.genres && filter.genres.length > 0) {
    params['genres.name'] = filter.genres
  }

  const { data } = await apiClient.get<ApiMoviesResponse>('/v1.4/movie', { params, signal: opts?.signal })

  const mapped: MoviesResponse = {
    docs: data.docs.map(mapMovieFromApi),
    total: data.total,
    page: data.page,
    pages: data.pages,
  }

  cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value: mapped })
  return mapped
}

export const prefetchMovies = async (
  filter: MoviesFilter,
  opts?: { signal?: AbortSignal },
) => {
  const cacheKey = makeCacheKey(filter)
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  return fetchMovies(filter, { signal: opts?.signal }).catch(() => undefined)
}

export const fetchMovieById = async (id: string | number): Promise<MovieDetails> => {
  const { data } = await apiClient.get<ApiMovie>(`/v1.4/movie/${id}`)
  return mapMovieDetailsFromApi(data)
}


