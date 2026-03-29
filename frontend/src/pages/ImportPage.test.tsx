import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import ImportPage from './ImportPage'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'
import { SESSION_1 } from '../test/fixtures'

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

  it('renders a Browse… button', () => {
    renderWithProviders(<ImportPage />)
    expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument()
  })

  it('renders a hidden file input that accepts only .csv files', () => {
    renderWithProviders(<ImportPage />)
    const fileInput = document.querySelector('input[data-testid="csv-file-input"]') as HTMLInputElement
    expect(fileInput).not.toBeNull()
    expect(fileInput.type).toBe('file')
    expect(fileInput.accept).toBe('.csv')
  })

  it('Import Session button becomes enabled once all required fields are filled (path mode)', async () => {
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

  it('selecting a local file populates the path field with the filename', async () => {
    renderWithProviders(<ImportPage />)

    const fileInput = document.querySelector('input[data-testid="csv-file-input"]') as HTMLInputElement
    const mockFile = new File(['time,front_raw\n0,1000\n'], 'my_session.csv', { type: 'text/csv' })
    await userEvent.upload(fileInput, mockFile)

    expect(screen.getByPlaceholderText(/session01\.csv/i)).toHaveValue('my_session.csv')
    expect(screen.getByText(/local file selected/i)).toBeInTheDocument()
  })

  it('clearing the selected file resets the path field', async () => {
    renderWithProviders(<ImportPage />)

    const fileInput = document.querySelector('input[data-testid="csv-file-input"]') as HTMLInputElement
    const mockFile = new File(['time,front_raw\n'], 'session.csv', { type: 'text/csv' })
    await userEvent.upload(fileInput, mockFile)

    await userEvent.click(screen.getByRole('button', { name: /clear/i }))

    expect(screen.getByPlaceholderText(/session01\.csv/i)).toHaveValue('')
    expect(screen.queryByText(/local file selected/i)).not.toBeInTheDocument()
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

  it('shows a success banner with an "Analyze Now" button after a successful path import', async () => {
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

  it('shows a success banner after uploading a local file', async () => {
    server.use(
      http.post('http://localhost:8000/api/v1/sessions/upload', () =>
        HttpResponse.json({ ...SESSION_1, name: 'Local Upload' }, { status: 201 })
      )
    )
    renderWithProviders(<ImportPage />)

    await waitFor(() =>
      expect(screen.getByRole('option', { name: /ténéré 700/i })).toBeInTheDocument()
    )

    const fileInput = document.querySelector('input[data-testid="csv-file-input"]') as HTMLInputElement
    const mockFile = new File(['time,front_raw\n0,1000\n'], 'ride.csv', { type: 'text/csv' })
    await userEvent.upload(fileInput, mockFile)

    await userEvent.type(screen.getByPlaceholderText(/sunday rocky peak/i), 'Local Upload')
    await userEvent.selectOptions(screen.getByRole('combobox'), 't7_test')
    await userEvent.click(screen.getByRole('button', { name: /import session/i }))

    await waitFor(() =>
      expect(screen.getByText(/session imported successfully/i)).toBeInTheDocument()
    )
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
