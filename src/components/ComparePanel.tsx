import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCompare } from '../store/useCompare'

export const ComparePanel = () => {
  const { items } = useCompare()
  const [collapsed, setCollapsed] = useState(false)

  if (items.length === 0) return null

  const [first, second] = items
  const count = items.length

  return (
    <section className={collapsed ? 'compare-panel compare-panel--collapsed' : 'compare-panel'}>
      <div className="compare-panel__header">
        <h2 className="compare-panel__title">Сравнение фильмов</h2>
        <button
          type="button"
          className="compare-panel__toggle"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? `Показать (${count})` : 'Скрыть'}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="compare-panel__table-wrapper">
            <table className="compare-panel__table">
              <thead>
                <tr>
                  <th>Поле</th>
                  <th>{first ? <Link to={`/movies/${first.id}`}>{first.name}</Link> : '—'}</th>
                  <th>{second ? <Link to={`/movies/${second.id}`}>{second.name}</Link> : '—'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Год</td>
                  <td>{first?.year ?? '—'}</td>
                  <td>{second?.year ?? '—'}</td>
                </tr>
                <tr>
                  <td>Рейтинг</td>
                  <td>{first?.rating ?? '—'}</td>
                  <td>{second?.rating ?? '—'}</td>
                </tr>
                <tr>
                  <td>Жанры</td>
                  <td>{first?.genres?.map((g) => g.name).join(', ') ?? '—'}</td>
                  <td>{second?.genres?.map((g) => g.name).join(', ') ?? '—'}</td>
                </tr>
                <tr>
                  <td>Длительность (мин)</td>
                  <td>{first?.movieLength ?? '—'}</td>
                  <td>{second?.movieLength ?? '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

