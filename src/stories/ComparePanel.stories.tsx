import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { ComparePanel } from '../components/ComparePanel'
import { CompareProvider, useCompare } from '../store/CompareContext'
import type { MovieShort } from '../types/movie'

const sampleItems: MovieShort[] = [
  {
    id: 1,
    name: 'Интерстеллар',
    year: 2014,
    rating: 8.6,
    genres: [{ name: 'фантастика' }, { name: 'драма' }],
    movieLength: 169,
  },
  {
    id: 2,
    name: 'Начало',
    year: 2010,
    rating: 8.7,
    genres: [{ name: 'боевик' }, { name: 'триллер' }],
    movieLength: 148,
  },
]

const WithItems = () => {
  const { toggleItem } = useCompare()

  useEffect(() => {
    sampleItems.forEach((movie) => toggleItem(movie))
  }, [])

  return <ComparePanel />
}

const meta: Meta<typeof WithItems> = {
  title: 'Movie/ComparePanel',
  component: WithItems,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <CompareProvider>
          <div style={{ paddingBottom: 120 }}>
            <Story />
          </div>
        </CompareProvider>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof WithItems>

export const Default: Story = {}

