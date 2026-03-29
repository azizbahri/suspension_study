import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import ImportPage from './ImportPage'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'

vi.mock('recharts')

describe('ImportPage', () => {
  it('renders the page heading', () => {
    renderWithProviders(<ImportPage />)
    expect(screen.getByRole('heading', { name: /import session/i })).toBeInTheDocument()
  })

  it('Import Session button is disabled when required fields are empty', () => {
    renderWithProviders(<ImportPage />)
    expect(screen.getByRole('button', { name: /import session/i })).toBeDisabled()
  })

  it('Import Session button becomes enabled once all required fields are filled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ImportPage />)

    // Wait for bikes to load from MSW
    await waitFor(() =>
      expect(screen.getByRole('option', { name: /ténéré 700/i })).toBeInTheDocument()
    )

    await user.type(
      screen.getByPlaceholderText(/session01\.csv/i),
      '/data/myride.csv'
    )
    await user.type(
      screen.getByPlaceholderText(/sunday rocky peak/i),
      'My Test Ride'
    )
    await user.selectOptions(screen.getByRole('combobox'), 't7_test')

    expect(screen.getByRole('button', { name: /import session/i })).toBeEnabled()
  })

  it('shows an error banner when the API returns an error', async () => {
    server.use(
      http.post('http://localhost:8000/api/v1/sessions/import', () =>
        HttpResponse.json({ detail: 'CSV file not found on disk' }, { status: 404 })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<ImportPage />)

    await waitFor(() =>
      expect(screen.getByRole('option', { name: /ténéré 700/i })).toBeInTheDocument()
    )

    await user.type(screen.getByPlaceholderText(/session01\.csv/i), '/bad/path.csv')
    await user.type(screen.getByPlaceholderText(/sunday rocky peak/i), 'Bad Session')
    await user.selectOptions(screen.getByRole('combobox'), 't7_test')
    await user.click(screen.getByRole('button', { name: /import session/i }))

    await waitFor(() =>
      expect(screen.getByText('CSV file not found on disk')).toBeInTheDocument()
    )
  })

  it('shows a success banner with an "Analyze Now" button after a successful import', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ImportPage />)

    await waitFor(() =>
      expect(screen.getByRole('option', { name: /ténéré 700/i })).toBeInTheDocument()
    )

    await user.type(screen.getByPlaceholderText(/session01\.csv/i), '/data/good.csv')
    await user.type(screen.getByPlaceholderText(/sunday rocky peak/i), 'Good Session')
    await user.selectOptions(screen.getByRole('combobox'), 't7_test')
    await user.click(screen.getByRole('button', { name: /import session/i }))

    await waitFor(() =>
      expect(screen.getByText(/session imported successfully/i)).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: /analyze now/i })).toBeInTheDocument()
  })

  it('renders default column map field names', () => {
    renderWithProviders(<ImportPage />)
    // Default values for column mapping inputs
    expect(screen.getByDisplayValue('front_raw')).toBeInTheDocument()
    expect(screen.getByDisplayValue('rear_raw')).toBeInTheDocument()
    expect(screen.getByDisplayValue('gyro_y')).toBeInTheDocument()
  })

  it('renders invert front and invert rear checkboxes unchecked by default', () => {
    renderWithProviders(<ImportPage />)
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((cb) => expect(cb).not.toBeChecked())
  })

  it('wheel velocity radio is selected by default', () => {
    renderWithProviders(<ImportPage />)
    expect(screen.getByRole('radio', { name: /wheel/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /shaft/i })).not.toBeChecked()
  })
})
