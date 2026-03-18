import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import type { MoviesFiltersValue } from './MoviesFilters'
import { MoviesFilters } from './MoviesFilters'

const renderWithRouter = (ui: React.ReactNode) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

const defaultValue: MoviesFiltersValue = {
  query: '',
  genres: [],
  ratingFrom: 0,
  ratingTo: 10,
  yearFrom: 1990,
  yearTo: new Date().getFullYear(),
}

describe('MoviesFilters', () => {
  it('shows error when ratingFrom is greater than ratingTo', () => {
    const handleChange = vi.fn()

    renderWithRouter(<MoviesFilters value={defaultValue} onChange={handleChange} />)

    const inputs = screen.getAllByRole('spinbutton')
    const ratingFromInput = inputs[0]
    const ratingToInput = inputs[1]

    fireEvent.change(ratingFromInput, { target: { value: '9' } })
    fireEvent.change(ratingToInput, { target: { value: '5' } })

    expect(screen.getByText(/Максимальный рейтинг не может быть меньше минимального/i)).toBeInTheDocument()
  })

  it('shows error when yearFrom is less than 1990', () => {
    const handleChange = vi.fn()

    renderWithRouter(<MoviesFilters value={defaultValue} onChange={handleChange} />)

    const yearInputs = screen.getAllByRole('spinbutton').slice(-2)
    const yearFromInput = yearInputs[0]

    fireEvent.change(yearFromInput, { target: { value: '1980' } })

    expect(screen.getByText(/Год должен быть от 1990/i)).toBeInTheDocument()
  })
})

