import { Link } from 'react-router-dom'
import type { MovieShort } from '../types/movie'
import { useFavorites } from '../store/useFavorites'
import { useCompare } from '../store/useCompare'

interface MovieCardProps {
  movie: MovieShort
  onRequestAddToFavorites?: (movie: MovieShort) => void
  onRequestRemoveFromFavorites?: (movie: MovieShort) => void
}

export const MovieCard = ({ movie, onRequestAddToFavorites, onRequestRemoveFromFavorites }: MovieCardProps) => {
  const { isFavorite } = useFavorites()
  const { isInCompare, toggleItem } = useCompare()

  const favorite = isFavorite(movie.id)
  const posterUrl = movie.poster?.previewUrl || movie.poster?.url
  const genres = movie.genres?.map((g) => g.name).join(', ') ?? '—'

  return (
    <article className="movie-card">
      <Link to={`/movies/${movie.id}`} className="movie-card__main">
        <div className="movie-card__poster-wrapper">
          {posterUrl ? (
            <img src={posterUrl} alt={movie.name} className="movie-card__poster" loading="lazy" />
          ) : (
            <div className="movie-card__poster movie-card__poster--placeholder">Нет постера</div>
          )}
        </div>
        <div className="movie-card__info">
          <h3 className="movie-card__title">{movie.name}</h3>
          <div className="movie-card__meta">
            <span>{movie.year ?? '—'}</span>
            <span className="movie-card__rating">{movie.rating ?? '—'}</span>
          </div>
          <div className="movie-card__genres">{genres}</div>
        </div>
      </Link>
      <div className="movie-card__actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            if (favorite) {
              onRequestRemoveFromFavorites?.(movie)
            } else {
              onRequestAddToFavorites?.(movie)
            }
          }}
          disabled={!favorite && !onRequestAddToFavorites}
        >
          {favorite ? 'Убрать из избранного' : 'В избранное'}
        </button>
        <button
          type="button"
          className={isInCompare(movie.id) ? 'btn btn--primary btn--outline' : 'btn btn--primary'}
          onClick={() => toggleItem(movie)}
        >
          {isInCompare(movie.id) ? 'Убрать из сравнения' : 'Сравнить'}
        </button>
      </div>
    </article>
  )
}

