import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export interface MoviesFiltersValue {
  query: string
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
  const [inputs, setInputs] = useState({
    ratingFrom: String(value.ratingFrom),
    ratingTo: String(value.ratingTo),
    yearFrom: String(value.yearFrom),
    yearTo: String(value.yearTo),
  })
  const [errors, setErrors] = useState({
    rating: '',
    year: '',
  })

  const defaults: MoviesFiltersValue = useMemo(
    () => ({
      query: '',
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
    const query = searchParams.get('q') ?? ''
    const genres = searchParams.get('genres')?.split(',').filter(Boolean) ?? []
    const ratingFrom = Number(searchParams.get('ratingFrom') ?? 0)
    const ratingTo = Number(searchParams.get('ratingTo') ?? 10)
    const yearFrom = Number(searchParams.get('yearFrom') ?? 1990)
    const yearTo = Number(searchParams.get('yearTo') ?? new Date().getFullYear())

    const next: MoviesFiltersValue = {
      query,
      genres,
      ratingFrom: clamp(ratingFrom, 0, 10),
      ratingTo: clamp(ratingTo, 0, 10),
      yearFrom: clamp(yearFrom, 1990, new Date().getFullYear()),
      yearTo: clamp(yearTo, 1990, new Date().getFullYear()),
    }
    didInitFromUrl.current = true

    const schedule = typeof queueMicrotask === 'function'
      ? queueMicrotask
      : (cb: () => void) => Promise.resolve().then(cb)

    schedule(() => {
      setInternal(next)
      setInputs({
        ratingFrom: String(next.ratingFrom),
        ratingTo: String(next.ratingTo),
        yearFrom: String(next.yearFrom),
        yearTo: String(next.yearTo),
      })
      onChange(next)
    })
  }, [onChange, searchParams])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (internal.query.trim()) {
      params.q = internal.query.trim()
    }
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
    internal.query.trim() !== '' ||
    internal.genres.length > 0 ||
    internal.ratingFrom !== defaults.ratingFrom ||
    internal.ratingTo !== defaults.ratingTo ||
    internal.yearFrom !== defaults.yearFrom ||
    internal.yearTo !== defaults.yearTo

  const hasNonQueryFilters =
    internal.genres.length > 0 ||
    internal.ratingFrom !== defaults.ratingFrom ||
    internal.ratingTo !== defaults.ratingTo ||
    internal.yearFrom !== defaults.yearFrom ||
    internal.yearTo !== defaults.yearTo

  const removeGenre = (genre: string) =>
    setInternal((prev) => ({ ...prev, genres: prev.genres.filter((g) => g !== genre) }))

  const handleNumericChange = (
    field: 'ratingFrom' | 'ratingTo' | 'yearFrom' | 'yearTo',
    raw: string,
  ) => {
    setInputs((prev) => ({ ...prev, [field]: raw }))

    if (raw === '') {
      setErrors((prev) =>
        field === 'ratingFrom' || field === 'ratingTo'
          ? { ...prev, rating: '' }
          : { ...prev, year: '' },
      )
      return
    }

    const valueNum = Number(raw)
    if (Number.isNaN(valueNum)) return

    setInternal((prev) => {
      if (field === 'ratingFrom') {
        if (valueNum < 0 || valueNum > 10) {
          setErrors((e) => ({ ...e, rating: 'Рейтинг должен быть от 0 до 10.' }))
          return prev
        }
        if (valueNum > prev.ratingTo) {
          setErrors((e) => ({ ...e, rating: 'Минимальный рейтинг не может быть больше максимального.' }))
          return prev
        }
        setErrors((e) => ({ ...e, rating: '' }))
        return { ...prev, ratingFrom: valueNum }
      }

      if (field === 'ratingTo') {
        if (valueNum < 0 || valueNum > 10) {
          setErrors((e) => ({ ...e, rating: 'Рейтинг должен быть от 0 до 10.' }))
          return prev
        }
        if (valueNum < prev.ratingFrom) {
          setErrors((e) => ({ ...e, rating: 'Максимальный рейтинг не может быть меньше минимального.' }))
          return prev
        }
        setErrors((e) => ({ ...e, rating: '' }))
        return { ...prev, ratingTo: valueNum }
      }

      if (field === 'yearFrom') {
        if (valueNum < 1990 || valueNum > currentYear) {
          setErrors((e) => ({ ...e, year: `Год должен быть от 1990 до ${currentYear}.` }))
          return prev
        }
        if (valueNum > prev.yearTo) {
          setErrors((e) => ({ ...e, year: 'Минимальный год не может быть больше максимального.' }))
          return prev
        }
        setErrors((e) => ({ ...e, year: '' }))
        return { ...prev, yearFrom: valueNum }
      }

      if (valueNum < 1990 || valueNum > currentYear) {
        setErrors((e) => ({ ...e, year: `Год должен быть от 1990 до ${currentYear}.` }))
        return prev
      }
      if (valueNum < prev.yearFrom) {
        setErrors((e) => ({ ...e, year: 'Максимальный год не может быть меньше минимального.' }))
        return prev
      }
      setErrors((e) => ({ ...e, year: '' }))
      return { ...prev, yearTo: valueNum }
    })
  }

  return (
    <section className="filters">
      <div className="filters__block">
        <div className="filters__header">
          <h2 className="filters__title">Поиск</h2>
          {hasAnyFilter && (
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setInternal(defaults)}
            >
              Сбросить
            </button>
          )}
        </div>
        <div className="filters__search">
          <input
            className="filters__search-input"
            placeholder="Название фильма"
            value={internal.query}
            onChange={(e) => setInternal((prev) => ({ ...prev, query: e.target.value }))}
          />
        </div>
          {internal.query.trim() && (
            <div className="filters__active">
              <button
                type="button"
                className="pill"
                onClick={() => setInternal((prev) => ({ ...prev, query: '' }))}
                title="Убрать поиск"
              >
                {internal.query.trim()} <span aria-hidden="true">×</span>
              </button>
            </div>
          )}
      </div>

      <div className="filters__block">
        <div className="filters__header">
          <h2 className="filters__title">Жанры</h2>
        </div>
        {hasNonQueryFilters && (
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
                value={inputs.ratingFrom}
                onChange={(e) => handleNumericChange('ratingFrom', e.target.value)}
              />
            </label>
            <label>
              до
              <input
                type="number"
                min={internal.ratingFrom}
                max={10}
                value={inputs.ratingTo}
                onChange={(e) => handleNumericChange('ratingTo', e.target.value)}
              />
            </label>
          </div>
          {errors.rating && <div className="filters__hint filters__hint--error">{errors.rating}</div>}
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
                value={inputs.yearFrom}
                onChange={(e) => handleNumericChange('yearFrom', e.target.value)}
              />
            </label>
            <label>
              до
              <input
                type="number"
                min={internal.yearFrom}
                max={currentYear}
                value={inputs.yearTo}
                onChange={(e) => handleNumericChange('yearTo', e.target.value)}
              />
            </label>
          </div>
          {errors.year && <div className="filters__hint filters__hint--error">{errors.year}</div>}
        </div>
      </div>
    </section>
  )
}

