import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PitchChart from './PitchChart'
import type { PitchTrace } from '../types/analysis'

vi.mock('recharts')

const SMALL_TRACE: PitchTrace = {
  time_s: [0, 1, 2, 3, 4],
  pitch_deg: [0, -1, -3, -2, 0],
  accel_x_g: [0, -0.1, -0.5, -0.3, 0],
}

describe('PitchChart', () => {
  it('renders the chart title', () => {
    render(<PitchChart data={SMALL_TRACE} sampleCount={5} />)
    // The title contains an HTML entity: "Pitch & Acceleration Trace"
    expect(screen.getByText('Pitch & Acceleration Trace')).toBeInTheDocument()
  })

  it('renders the recharts line chart container', () => {
    render(<PitchChart data={SMALL_TRACE} sampleCount={5} />)
    expect(screen.getByTestId('recharts-container')).toBeInTheDocument()
  })

  it('renders without errors for large sample count (downsampling path, step=4)', () => {
    const n = 6000
    const large: PitchTrace = {
      time_s: Array.from({ length: n }, (_, i) => i / 250),
      pitch_deg: Array.from({ length: n }, () => 0),
      accel_x_g: Array.from({ length: n }, () => 0),
    }
    expect(() => render(<PitchChart data={large} sampleCount={n} />)).not.toThrow()
  })
})
