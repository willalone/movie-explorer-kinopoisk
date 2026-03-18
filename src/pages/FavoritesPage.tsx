import { MovieCard } from '../components/MovieCard'
import { useFavorites } from '../store/useFavorites'
import { useState } from 'react'
import type { MovieShort } from '../types/movie'
import { ConfirmModal } from '../components/ConfirmModal'

export const FavoritesPage = () => {
  const { favorites, remove } = useFavorites()
  const [pendingRemove, setPendingRemove] = useState<MovieShort | null>(null)

  return (
    <div className="page page--favorites">
      <header className="page-header">
        <h1>Избранные фильмы</h1>
        <span className="page-header__meta">{favorites.length} в списке</span>
      </header>

      {favorites.length === 0 ? (
        <p>У вас пока нет избранных фильмов. Добавьте их на странице списка фильмов.</p>
      ) : (
        <div className="movies-grid">
          {favorites.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onRequestRemoveFromFavorites={(m) => setPendingRemove(m)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(pendingRemove)}
        title="Удалить фильм из избранного?"
        description={pendingRemove ? pendingRemove.name : undefined}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        onClose={() => setPendingRemove(null)}
        onConfirm={() => {
          if (pendingRemove) {
            remove(pendingRemove.id)
          }
        }}
      />
    </div>
  )
}

