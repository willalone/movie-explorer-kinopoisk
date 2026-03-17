import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface MoviesFiltersValue {
  genres: string[]
  ratingFrom: number
  ratingTo: number
  yearFrom: number
  yearTo: number
}

interface MoviesFiltersProps {
  value: MoviesFiltersValue
  onChange: (value: MoviesFiltersValue) => void
}

const AVAILABLE_GENRES = [
  'драма',
  'комедия',
  'боевик',
  'фантастика',
  'триллер',
  'мелодрама',
  'криминал',
  'ужасы',
]

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val))

export const MoviesFilters = ({ value, onChange }: MoviesFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [internal, setInternal] = useState<MoviesFiltersValue>(value)
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const didInitFromUrl = useRef(false)

  const defaults: MoviesFiltersValue = useMemo(
    () => ({
      genres: [],
      ratingFrom: 0,
      ratingTo: 10,
      yearFrom: 1990,
      yearTo: currentYear,
    }),
    [currentYear],
  )

  useEffect(() => {
    if (didInitFromUrl.current) return
    const genres = searchParams.get('genres')?.split(',').filter(Boolean) ?? []
    const ratingFrom = Number(searchParams.get('ratingFrom') ?? 0)
    const ratingTo = Number(searchParams.get('ratingTo') ?? 10)
    const yearFrom = Number(searchParams.get('yearFrom') ?? 1990)
    const yearTo = Number(searchParams.get('yearTo') ?? new Date().getFullYear())

    const next: MoviesFiltersValue = {
      genres,
      ratingFrom: clamp(ratingFrom, 0, 10),
      ratingTo: clamp(ratingTo, 0, 10),
      yearFrom: clamp(yearFrom, 1990, new Date().getFullYear()),
      yearTo: clamp(yearTo, 1990, new Date().getFullYear()),
    }
    setInternal(next)
    onChange(next)
    didInitFromUrl.current = true
  }, [onChange, searchParams])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (internal.genres.length) {
      params.genres = internal.genres.join(',')
    }
    params.ratingFrom = String(internal.ratingFrom)
    params.ratingTo = String(internal.ratingTo)
    params.yearFrom = String(internal.yearFrom)
    params.yearTo = String(internal.yearTo)
    setSearchParams(params, { replace: true })
    onChange(internal)
  }, [internal, onChange, setSearchParams])

  const handleGenreToggle = (genre: string) => {
    setInternal((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }))
  }

  const hasAnyFilter =
    internal.genres.length > 0 ||
    internal.ratingFrom !== defaults.ratingFrom ||
    internal.ratingTo !== defaults.ratingTo ||
    internal.yearFrom !== defaults.yearFrom ||
    internal.yearTo !== defaults.yearTo

  const removeGenre = (genre: string) =>
    setInternal((prev) => ({ ...prev, genres: prev.genres.filter((g) => g !== genre) }))

  return (
    <section className="filters">
      <div className="filters__block">
        <div className="filters__header">
          <h2 className="filters__title">Жанры</h2>
          {hasAnyFilter && (
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setInternal(defaults)}>
              Сбросить
            </button>
          )}
        </div>
        {hasAnyFilter && (
          <div className="filters__active">
            {internal.genres.map((g) => (
              <button key={g} type="button" className="pill" onClick={() => removeGenre(g)} title="Убрать жанр">
                {g} <span aria-hidden="true">×</span>
              </button>
            ))}
            {(internal.ratingFrom !== defaults.ratingFrom || internal.ratingTo !== defaults.ratingTo) && (
              <button
                type="button"
                className="pill"
                onClick={() => setInternal((prev) => ({ ...prev, ratingFrom: 0, ratingTo: 10 }))}
              >
                рейтинг {internal.ratingFrom}–{internal.ratingTo} <span aria-hidden="true">×</span>
              </button>
            )}
            {(internal.yearFrom !== defaults.yearFrom || internal.yearTo !== defaults.yearTo) && (
              <button
                type="button"
                className="pill"
                onClick={() => setInternal((prev) => ({ ...prev, yearFrom: 1990, yearTo: currentYear }))}
              >
                год {internal.yearFrom}–{internal.yearTo} <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
        )}
        <div className="filters__chips">
          {AVAILABLE_GENRES.map((genre) => {
            const active = internal.genres.includes(genre)
            return (
              <button
                key={genre}
                type="button"
                className={active ? 'chip chip--active' : 'chip'}
                onClick={() => handleGenreToggle(genre)}
              >
                {genre}
              </button>
            )
          })}
        </div>
      </div>

      <div className="filters__row">
        <div className="filters__block">
          <h2 className="filters__title">Рейтинг</h2>
          <div className="filters__range">
            <label>
              от
              <input
                type="number"
                min={0}
                max={internal.ratingTo}
                value={internal.ratingFrom}
                onChange={(e) =>
                  setInternal((prev) => ({
                    ...prev,
                    ratingFrom: clamp(Number(e.target.value), 0, prev.ratingTo),
                  }))
                }
              />
            </label>
            <label>
              до
              <input
                type="number"
                min={internal.ratingFrom}
                max={10}
                value={internal.ratingTo}
                onChange={(e) =>
                  setInternal((prev) => ({
                    ...prev,
                    ratingTo: clamp(Number(e.target.value), prev.ratingFrom, 10),
                  }))
                }
              />
            </label>
          </div>
        </div>

        <div className="filters__block">
          <h2 className="filters__title">Год выпуска</h2>
          <div className="filters__range">
            <label>
              от
              <input
                type="number"
                min={1990}
                max={internal.yearTo}
                value={internal.yearFrom}
                onChange={(e) =>
                  setInternal((prev) => ({
                    ...prev,
                    yearFrom: clamp(Number(e.target.value), 1990, prev.yearTo),
                  }))
                }
              />
            </label>
            <label>
              до
              <input
                type="number"
                min={internal.yearFrom}
                max={currentYear}
                value={internal.yearTo}
                onChange={(e) =>
                  setInternal((prev) => ({
                    ...prev,
                    yearTo: clamp(Number(e.target.value), prev.yearFrom, currentYear),
                  }))
                }
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}

