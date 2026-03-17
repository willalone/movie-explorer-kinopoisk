import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchMovieById } from '../api/movies'
import type { MovieDetails } from '../types/movie'

export const MovieDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchMovieById(id)
        setMovie(data)
      } catch {
        setError('Не удалось загрузить информацию о фильме.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  if (loading) {
    return (
      <div className="page page--movie-details">
        <p>Загрузка...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page page--movie-details">
        <p className="alert alert--error">{error}</p>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="page page--movie-details">
        <p>Фильм не найден.</p>
      </div>
    )
  }

  const posterUrl = movie.poster?.url || movie.poster?.previewUrl
  const genres = movie.genres?.map((g) => g.name).join(', ') ?? '—'

  return (
    <div className="page page--movie-details">
      <section className="movie-details">
        <div className="movie-details__poster-wrapper">
          {posterUrl ? (
            <img src={posterUrl} alt={movie.name} className="movie-details__poster" />
          ) : (
            <div className="movie-details__poster movie-details__poster--placeholder">Нет постера</div>
          )}
        </div>

        <div className="movie-details__content">
          <h1 className="movie-details__title">{movie.name}</h1>
          {movie.alternativeName && (
            <div className="movie-details__alt-name">{movie.alternativeName}</div>
          )}

          <div className="movie-details__meta">
            <span>Год: {movie.year ?? '—'}</span>
            <span>Рейтинг: {movie.rating ?? '—'}</span>
            <span>Длительность: {movie.movieLength ? `${movie.movieLength} мин` : '—'}</span>
          </div>

          <div className="movie-details__genres">Жанры: {genres}</div>

          {movie.premiere?.world && (
            <div className="movie-details__premiere">
              Дата выхода (мировая премьера):{' '}
              {new Date(movie.premiere.world).toLocaleDateString('ru-RU')}
            </div>
          )}

          {movie.description && (
            <div className="movie-details__section">
              <h2>Описание</h2>
              <p>{movie.description}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

