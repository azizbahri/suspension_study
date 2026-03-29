import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import VelocityHistogram from './VelocityHistogram'
import type { VelocityHistogram as VelocityHistogramType } from '../types/analysis'

vi.mock('recharts')

const DATA: VelocityHistogramType = {
  centers_mm_s: [-300, -150, 0, 150, 300],
  time_pct: [10, 20, 20, 30, 20],
  compression_area_pct: 40.0,
  rebound_area_pct: 60.0,
  ls_compression_pct: 18.0,
  hs_compression_pct: 22.0,
  ls_rebound_pct: 30.0,
  hs_rebound_pct: 30.0,
}

describe('VelocityHistogram', () => {
  it('renders the chart title', () => {
    render(<VelocityHistogram data={DATA} title="Front Velocity Distribution" />)
    expect(screen.getByText('Front Velocity Distribution')).toBeInTheDocument()
  })

  it('displays compression area percentage in legend', () => {
    render(<VelocityHistogram data={DATA} title="Test" />)
    expect(screen.getByText(/Comp 40\.0%/)).toBeInTheDocument()
  })

  it('displays rebound area percentage in legend', () => {
    render(<VelocityHistogram data={DATA} title="Test" />)
    expect(screen.getByText(/Reb 60\.0%/)).toBeInTheDocument()
  })

  it('displays LS and HS splits in legend', () => {
    render(<VelocityHistogram data={DATA} title="Test" />)
    expect(screen.getByText(/LS-C 18\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/HS-C 22\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/LS-R 30\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/HS-R 30\.0%/)).toBeInTheDocument()
  })

  it('renders the recharts container', () => {
    render(<VelocityHistogram data={DATA} title="Test" />)
    expect(screen.getByTestId('recharts-container')).toBeInTheDocument()
  })
})
