import { Route, Routes, Navigate, NavLink } from 'react-router-dom'
import { MoviesPage } from './pages/MoviesPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { MovieDetailsPage } from './pages/MovieDetailsPage'
import { ComparePanel } from './components/ComparePanel'
import './App.css'

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header__brand">Movie Explorer</div>
        <nav className="app-header__nav">
          <NavLink to="/movies" className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}>
            Фильмы
          </NavLink>
          <NavLink to="/favorites" className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}>
            Избранное
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/movies" replace />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="*" element={<Navigate to="/movies" replace />} />
        </Routes>
      </main>

      <ComparePanel />
    </div>
  )
}

export default App
