export const MovieCardSkeleton = () => {
  return (
    <article className="movie-card movie-card--skeleton" aria-hidden="true">
      <div className="movie-card__main">
        <div className="movie-card__poster-wrapper">
          <div className="skeleton skeleton--poster" />
        </div>
        <div className="movie-card__info">
          <div className="skeleton skeleton--title" />
          <div className="movie-card__meta">
            <div className="skeleton skeleton--meta" />
            <div className="skeleton skeleton--meta" />
          </div>
          <div className="skeleton skeleton--genres" />
        </div>
      </div>
      <div className="movie-card__actions">
        <div className="skeleton skeleton--button" />
        <div className="skeleton skeleton--button" />
      </div>
    </article>
  )
}

