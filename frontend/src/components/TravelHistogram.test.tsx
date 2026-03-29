import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TravelHistogram from './TravelHistogram'
import type { TravelHistogram as TravelHistogramType } from '../types/analysis'

vi.mock('recharts')

const DATA: TravelHistogramType = {
  centers_pct: [10, 20, 30, 40, 50, 60, 70, 80, 90],
  time_pct: [5, 10, 25, 20, 15, 10, 8, 5, 2],
  peak_center_pct: 35.0,
  pct_above_80: 7.5,
}

describe('TravelHistogram', () => {
  it('renders the chart title', () => {
    render(<TravelHistogram data={DATA} title="Front Travel Distribution" />)
    expect(screen.getByText('Front Travel Distribution')).toBeInTheDocument()
  })

  it('displays the peak center percentage', () => {
    render(<TravelHistogram data={DATA} title="Test" />)
    const statsEl = screen.getByText(/Peak:/)
    expect(statsEl.textContent).toContain('35.0%')
  })

  it('displays the above-80% time percentage', () => {
    render(<TravelHistogram data={DATA} title="Test" />)
    const statsEl = screen.getByText(/Peak:/)
    expect(statsEl.textContent).toContain('7.5%')
  })

  it('renders the recharts container', () => {
    render(<TravelHistogram data={DATA} title="Test" />)
    expect(screen.getByTestId('recharts-container')).toBeInTheDocument()
  })
})
