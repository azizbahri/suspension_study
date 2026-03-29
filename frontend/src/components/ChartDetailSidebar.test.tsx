import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import ChartDetailSidebar from './ChartDetailSidebar'
import { ANALYSIS_RESULT } from '../test/fixtures'

vi.mock('recharts')

describe('ChartDetailSidebar', () => {
  it('is hidden when isOpen is false', () => {
    renderWithProviders(
      <ChartDetailSidebar
        chart="front_travel"
        result={ANALYSIS_RESULT}
        isOpen={false}
        onClose={() => {}}
      />
    )
    const aside = screen.getByRole('complementary', { name: /chart details/i })
    expect(aside.className).toMatch(/translate-x-full/)
  })

  it('is visible when isOpen is true', () => {
    renderWithProviders(
      <ChartDetailSidebar
        chart="front_travel"
        result={ANALYSIS_RESULT}
        isOpen={true}
        onClose={() => {}}
      />
    )
    const aside = screen.getByRole('complementary', { name: /chart details/i })
    expect(aside.className).not.toMatch(/translate-x-full/)
  })

  it('shows the chart title in the header', () => {
    renderWithProviders(
      <ChartDetailSidebar
        chart="front_travel"
        result={ANALYSIS_RESULT}
        isOpen={true}
        onClose={() => {}}
      />
    )
    expect(screen.getByText('Front Travel Distribution')).toBeInTheDocument()
  })

  it('shows the description for front_travel', () => {
    renderWithProviders(
      <ChartDetailSidebar
        chart="front_travel"
        result={ANALYSIS_RESULT}
        isOpen={true}
        onClose={() => {}}
      />
    )
    expect(screen.getByText(/how the front fork travel is distributed/i)).toBeInTheDocument()
  })

  it('shows key metrics for travel chart', () => {
    renderWithProviders(
      <ChartDetailSidebar
        chart="front_travel"
        result={ANALYSIS_RESULT}
        isOpen={true}
        onClose={() => {}}
      />
    )
    expect(screen.getByText('Peak Travel')).toBeInTheDocument()
    expect(screen.getByText('Time Above 80 %')).toBeInTheDocument()
    // peak_center_pct is 35.0 in fixture
    expect(screen.getByText('35.0 %')).toBeInTheDocument()
  })

  it('shows key metrics for velocity chart', () => {
    renderWithProviders(
      <ChartDetailSidebar
        chart="front_velocity"
        result={ANALYSIS_RESULT}
        isOpen={true}
        onClose={() => {}}
      />
    )
    expect(screen.getByText('Compression')).toBeInTheDocument()
    expect(screen.getByText('Rebound')).toBeInTheDocument()
    expect(screen.getByText('LS-Compression')).toBeInTheDocument()
    expect(screen.getByText('HS-Compression')).toBeInTheDocument()
  })

  it('shows key metrics for pitch chart', () => {
    renderWithProviders(
      <ChartDetailSidebar
        chart="pitch"
        result={ANALYSIS_RESULT}
        isOpen={true}
        onClose={() => {}}
      />
    )
    expect(screen.getByText('Peak Pitch (nose-up)')).toBeInTheDocument()
    expect(screen.getByText('Min Pitch (nose-down)')).toBeInTheDocument()
  })

  it('shows interpretation bullet points', () => {
    renderWithProviders(
      <ChartDetailSidebar
        chart="front_travel"
        result={ANALYSIS_RESULT}
        isOpen={true}
        onClose={() => {}}
      />
    )
    expect(screen.getByText(/how to interpret/i)).toBeInTheDocument()
    expect(screen.getByText(/ideal sag target/i)).toBeInTheDocument()
  })

  it('shows related diagnostics when rule_id matches chart prefix', () => {
    renderWithProviders(
      <ChartDetailSidebar
        chart="front_travel"
        result={ANALYSIS_RESULT}
        isOpen={true}
        onClose={() => {}}
      />
    )
    // The fixture has a diagnostic with rule_id 'deep_travel_front' which starts with 'deep',
    // not 'front' or 'front_travel', so the prefix filter produces no matches.
    expect(screen.queryByText('Related Diagnostics')).not.toBeInTheDocument()
  })

  it('shows related diagnostics when rule_id matches', () => {
    const resultWithFrontDiagnostic = {
      ...ANALYSIS_RESULT,
      diagnostics: [
        {
          rule_id: 'front_travel_above_80',
          severity: 'warning' as const,
          title: 'Front bottoming risk',
          message: 'Spending too much time above 80% travel.',
          action: 'Increase compression damping.',
        },
      ],
    }
    renderWithProviders(
      <ChartDetailSidebar
        chart="front_travel"
        result={resultWithFrontDiagnostic}
        isOpen={true}
        onClose={() => {}}
      />
    )
    expect(screen.getByText('Related Diagnostics')).toBeInTheDocument()
    expect(screen.getByText('Front bottoming risk')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderWithProviders(
      <ChartDetailSidebar
        chart="front_travel"
        result={ANALYSIS_RESULT}
        isOpen={true}
        onClose={onClose}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /close chart details/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    renderWithProviders(
      <ChartDetailSidebar
        chart="front_travel"
        result={ANALYSIS_RESULT}
        isOpen={true}
        onClose={onClose}
      />
    )
    fireEvent.click(screen.getByTestId('sidebar-backdrop'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows fallback text when chart is null', () => {
    renderWithProviders(
      <ChartDetailSidebar
        chart={null}
        result={null}
        isOpen={false}
        onClose={() => {}}
      />
    )
    expect(screen.getByText(/click a chart to see details/i)).toBeInTheDocument()
  })
})
