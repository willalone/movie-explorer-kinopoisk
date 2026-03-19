import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { FavoritesProvider } from './store/FavoritesProvider'
import { CompareProvider } from './store/CompareProvider'

const ghBasename = '/movie-explorer-kinopoisk'
const basename =
  typeof window !== 'undefined' &&
  (window.location.pathname === ghBasename || window.location.pathname.startsWith(`${ghBasename}/`))
    ? ghBasename
    : '/'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <FavoritesProvider>
        <CompareProvider>
          <App />
        </CompareProvider>
      </FavoritesProvider>
    </BrowserRouter>
  </StrictMode>,
)
