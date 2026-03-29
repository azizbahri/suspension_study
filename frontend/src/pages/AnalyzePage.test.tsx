import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import AnalyzePage from './AnalyzePage'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'
import { ANALYSIS_RESULT } from '../test/fixtures'

vi.mock('recharts')

describe('AnalyzePage', () => {
  it('renders the page heading', () => {
    renderWithProviders(<AnalyzePage />)
    expect(screen.getByRole('heading', { name: /analyze/i })).toBeInTheDocument()
  })

  it('renders a session selector dropdown', async () => {
    renderWithProviders(<AnalyzePage />)
    await waitFor(() =>
      expect(screen.getByRole('option', { name: /sunday rocky peak/i })).toBeInTheDocument()
    )
  })

  it('Analyze button is disabled when no session is selected', () => {
    renderWithProviders(<AnalyzePage />)
    expect(
      screen.getByRole('button', { name: /analyze/i })
    ).toBeDisabled()
  })

  it('Analyze button is enabled once a session is selected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AnalyzePage />)
    await waitFor(() =>
      expect(screen.getByRole('option', { name: /sunday rocky peak/i })).toBeInTheDocument()
    )
    await user.selectOptions(screen.getByRole('combobox'), 'session-1')
    expect(screen.getByRole('button', { name: /analyze/i })).toBeEnabled()
  })

  it('shows analysis results (duration + sample count) after clicking Analyze', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AnalyzePage />)
    await waitFor(() =>
      expect(screen.getByRole('option', { name: /sunday rocky peak/i })).toBeInTheDocument()
    )
    await user.selectOptions(screen.getByRole('combobox'), 'session-1')
    await user.click(screen.getByRole('button', { name: /analyze/i }))

    await waitFor(() =>
      expect(screen.getByText(/30\.0 s/)).toBeInTheDocument()
    )
    expect(screen.getByText(/7,500/)).toBeInTheDocument()
  })

  it('shows an error banner when analysis fails', async () => {
    server.use(
      http.post('http://localhost:8000/api/v1/analyze/:id', () =>
        HttpResponse.json({ detail: 'Processing error' }, { status: 500 })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<AnalyzePage />)
    await waitFor(() =>
      expect(screen.getByRole('option', { name: /sunday rocky peak/i })).toBeInTheDocument()
    )
    await user.selectOptions(screen.getByRole('combobox'), 'session-1')
    await user.click(screen.getByRole('button', { name: /analyze/i }))

    await waitFor(() =>
      expect(screen.getByText('Processing error')).toBeInTheDocument()
    )
  })

  it('renders diagnostic cards sorted critical → warning → info', async () => {
    const diagnostics = [
      {
        rule_id: 'r_info',
        severity: 'info' as const,
        title: 'Info note',
        message: 'msg',
        action: 'act',
      },
      {
        rule_id: 'r_critical',
        severity: 'critical' as const,
        title: 'Critical note',
        message: 'msg',
        action: 'act',
      },
      {
        rule_id: 'r_warning',
        severity: 'warning' as const,
        title: 'Warning note',
        message: 'msg',
        action: 'act',
      },
    ]
    server.use(
      http.post('http://localhost:8000/api/v1/analyze/:id', () =>
        HttpResponse.json({ ...ANALYSIS_RESULT, diagnostics })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<AnalyzePage />)
    await waitFor(() =>
      expect(screen.getByRole('option', { name: /sunday rocky peak/i })).toBeInTheDocument()
    )
    await user.selectOptions(screen.getByRole('combobox'), 'session-1')
    await user.click(screen.getByRole('button', { name: /analyze/i }))

    await waitFor(() =>
      expect(screen.getByText('Critical note')).toBeInTheDocument()
    )
    const titles = screen.getAllByText(/note/).map((el) => el.textContent)
    expect(titles[0]).toBe('Critical note')
    expect(titles[1]).toBe('Warning note')
    expect(titles[2]).toBe('Info note')
  })
})
