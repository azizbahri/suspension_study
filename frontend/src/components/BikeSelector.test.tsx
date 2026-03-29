import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BikeSelector from './BikeSelector'
import { T7_BIKE } from '../test/fixtures'
import type { BikeProfile } from '../types/bike'

const BIKES: BikeProfile[] = [
  T7_BIKE,
  { ...T7_BIKE, name: 'Honda CRF450RX', slug: 'crf450' },
]

describe('BikeSelector', () => {
  it('renders placeholder option when bike list is empty', () => {
    render(<BikeSelector bikes={[]} value="" onChange={vi.fn()} />)
    expect(screen.getByRole('option', { name: /select bike profile/i })).toBeInTheDocument()
  })

  it('renders an option for each bike', () => {
    render(<BikeSelector bikes={BIKES} value="" onChange={vi.fn()} />)
    expect(screen.getByRole('option', { name: T7_BIKE.name })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Honda CRF450RX' })).toBeInTheDocument()
  })

  it('reflects the currently selected value', () => {
    render(<BikeSelector bikes={BIKES} value="crf450" onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveValue('crf450')
  })

  it('calls onChange with the selected slug when an option is chosen', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<BikeSelector bikes={BIKES} value="" onChange={onChange} />)
    await user.selectOptions(screen.getByRole('combobox'), 'crf450')
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith('crf450')
  })

  it('applies custom className to the select element', () => {
    render(<BikeSelector bikes={[]} value="" onChange={vi.fn()} className="w-full" />)
    expect(screen.getByRole('combobox')).toHaveClass('w-full')
  })
})
