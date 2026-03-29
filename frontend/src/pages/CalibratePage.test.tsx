import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import CalibratePage from './CalibratePage'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'

vi.mock('recharts')

describe('CalibratePage', () => {
  it('renders front and rear calibration section headings', () => {
    renderWithProviders(<CalibratePage />)
    expect(screen.getByText(/front fork calibration/i)).toBeInTheDocument()
    expect(screen.getByText(/rear linkage calibration/i)).toBeInTheDocument()
  })

  it('shows an error when fewer than 2 valid front data points are entered', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CalibratePage />)

    // Leave all rows blank and click Fit
    await user.click(screen.getAllByRole('button', { name: /^fit$/i })[0])
    expect(screen.getByText(/need at least 2 valid data points/i)).toBeInTheDocument()
  })

  it('shows calibration result after a successful front fit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CalibratePage />)

    // Stroke column inputs (first two rows, first column = stroke_mm)
    const strokeInputs = screen
      .getAllByRole('spinbutton')
      .filter((_, i) => i % 2 === 0)
      .slice(0, 2)
    const voltageInputs = screen
      .getAllByRole('spinbutton')
      .filter((_, i) => i % 2 === 1)
      .slice(0, 2)

    await user.type(strokeInputs[0], '0')
    await user.type(voltageInputs[0], '0.5')
    await user.type(strokeInputs[1], '100')
    await user.type(voltageInputs[1], '2.9')

    await user.click(screen.getAllByRole('button', { name: /^fit$/i })[0])

    await waitFor(() =>
      expect(screen.getByText(/C_cal:/i)).toBeInTheDocument()
    )
    expect(screen.getByText(/42\.0000/)).toBeInTheDocument()
  })

  it('renders the Bike Profiles section heading', () => {
    renderWithProviders(<CalibratePage />)
    expect(screen.getByText('Bike Profiles')).toBeInTheDocument()
  })

  it('renders the bike list from the API', async () => {
    renderWithProviders(<CalibratePage />)
    await waitFor(() =>
      expect(screen.getByText('Yamaha Ténéré 700 (Test Profile)')).toBeInTheDocument()
    )
  })

  it('shows the new bike form when "+ New Profile" is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CalibratePage />)
    await user.click(screen.getByRole('button', { name: /\+ new profile/i }))
    expect(screen.getByText(/new bike profile/i)).toBeInTheDocument()
  })

  it('shows an edit form when Edit is clicked on an existing bike', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CalibratePage />)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    )
    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(screen.getByText(/edit: t7_test/i)).toBeInTheDocument()
  })

  it('shows an error when rear fit fails', async () => {
    server.use(
      http.post('http://localhost:8000/api/v1/calibrate/rear', () =>
        HttpResponse.json({ detail: 'Singular matrix' }, { status: 422 })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<CalibratePage />)

    const allSpinbuttons = screen.getAllByRole('spinbutton')
    // rear inputs start after the 6 front inputs
    const rearStroke1 = allSpinbuttons[6]
    const rearTravel1 = allSpinbuttons[7]
    const rearStroke2 = allSpinbuttons[8]
    const rearTravel2 = allSpinbuttons[9]

    await user.type(rearStroke1, '0')
    await user.type(rearTravel1, '0')
    await user.type(rearStroke2, '50')
    await user.type(rearTravel2, '100')

    await user.click(screen.getAllByRole('button', { name: /^fit$/i })[1])

    await waitFor(() =>
      expect(screen.getByText('Singular matrix')).toBeInTheDocument()
    )
  })

  it('opens the info sidebar when an info button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CalibratePage />)

    const infoButtons = screen.getAllByRole('button', { name: /more info about/i })
    await user.click(infoButtons[0])

    // Sidebar panel should be visible with field details content
    expect(screen.getByRole('complementary', { name: /field details/i })).toBeInTheDocument()
    // A section heading inside the sidebar should appear
    expect(screen.getByText(/what this is/i)).toBeInTheDocument()
  })

  it('closes the info sidebar when the close button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CalibratePage />)

    // Open the sidebar
    const infoButtons = screen.getAllByRole('button', { name: /more info about/i })
    await user.click(infoButtons[0])
    expect(screen.getByText(/what this is/i)).toBeInTheDocument()

    // Close it
    await user.click(screen.getByRole('button', { name: /close field details/i }))

    // The sidebar content should no longer be present
    await waitFor(() =>
      expect(screen.queryByText(/what this is/i)).not.toBeInTheDocument()
    )
  })
})
