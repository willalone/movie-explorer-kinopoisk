import type { Meta, StoryObj } from '@storybook/react-vite'
import { BrowserRouter } from 'react-router-dom'
import { MovieCard } from '../components/MovieCard'
import { FavoritesProvider } from '../store/FavoritesProvider'
import { CompareProvider } from '../store/CompareProvider'
import type { MovieShort } from '../types/movie'

const meta: Meta<typeof MovieCard> = {
  title: 'Movie/MovieCard',
  component: MovieCard,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <FavoritesProvider>
          <CompareProvider>
            <div style={{ width: 260 }}>
              <Story />
            </div>
          </CompareProvider>
        </FavoritesProvider>
      </BrowserRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MovieCard>

const sample: MovieShort = {
  id: 1,
  name: 'Интерстеллар',
  year: 2014,
  rating: 8.6,
  genres: [{ name: 'фантастика' }, { name: 'драма' }],
  poster: {
    previewUrl: 'https://via.placeholder.com/300x450?text=Poster',
  },
  movieLength: 169,
}

export const Default: Story = {
  args: {
    movie: sample,
  },
}

