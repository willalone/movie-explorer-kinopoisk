import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { FavoritesProvider } from './store/FavoritesProvider'
import { CompareProvider } from './store/CompareProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <FavoritesProvider>
        <CompareProvider>
          <App />
        </CompareProvider>
      </FavoritesProvider>
    </BrowserRouter>
  </StrictMode>,
)
