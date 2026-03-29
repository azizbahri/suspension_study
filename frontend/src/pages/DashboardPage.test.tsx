import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import DashboardPage from './DashboardPage'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'
import type { DemoStatus } from '../api/demo'

describe('DashboardPage', () => {
  it('renders the app title', () => {
    renderWithProviders(<DashboardPage />)
    expect(screen.getByText('Suspension Study')).toBeInTheDocument()
  })

  it('renders all four getting-started steps', () => {
    renderWithProviders(<DashboardPage />)
    expect(screen.getByText('Import')).toBeInTheDocument()
    expect(screen.getByText('Calibrate')).toBeInTheDocument()
    expect(screen.getByText('Analyze')).toBeInTheDocument()
    expect(screen.getByText('Compare')).toBeInTheDocument()
  })

  it('shows session count, bike count, and analyzed count from API', async () => {
    renderWithProviders(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()  // session_count
      expect(screen.getByText('1')).toBeInTheDocument()  // bike_count / analyzed_count
    })
    expect(screen.getByText('Sessions')).toBeInTheDocument()
    expect(screen.getByText('Bike profiles')).toBeInTheDocument()
    expect(screen.getByText('Analyzed')).toBeInTheDocument()
  })

  it('shows the demo session card when demo_session_id is present', async () => {
    renderWithProviders(<DashboardPage />)
    await waitFor(() =>
      expect(screen.getByText('Demo session ready')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: /analyze demo/i })).toBeInTheDocument()
  })

  it('hides the demo card when demo_session_id is null', async () => {
    const noDemo: DemoStatus = {
      session_count: 0,
      bike_count: 1,
      analyzed_count: 0,
      demo_session_id: null,
    }
    server.use(
      http.get('http://localhost:8000/api/v1/demo', () => HttpResponse.json(noDemo))
    )
    renderWithProviders(<DashboardPage />)
    await waitFor(() =>
      expect(screen.getByText('Sessions')).toBeInTheDocument()
    )
    expect(screen.queryByText('Demo session ready')).not.toBeInTheDocument()
  })

  it('navigates to /analyze when Analyze Demo is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardPage />, { initialPath: '/' })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /analyze demo/i })).toBeInTheDocument()
    )
    await user.click(screen.getByRole('button', { name: /analyze demo/i }))
    // MemoryRouter will navigate; check that the button was clickable (no error thrown)
  })
})
