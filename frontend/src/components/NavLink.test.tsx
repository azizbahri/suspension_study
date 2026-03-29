import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NavLink from './NavLink'

function renderNavLink(expanded: boolean, currentPath = '/import') {
  return render(
    <MemoryRouter initialEntries={[currentPath]}>
      <NavLink
        to="/import"
        icon={<span data-testid="nav-icon" />}
        label="Import"
        expanded={expanded}
      />
    </MemoryRouter>
  )
}

describe('NavLink', () => {
  it('always renders the icon', () => {
    renderNavLink(false)
    expect(screen.getByTestId('nav-icon')).toBeInTheDocument()
  })

  it('shows the label when expanded is true', () => {
    renderNavLink(true)
    expect(screen.getByText('Import')).toBeInTheDocument()
  })

  it('hides the label when expanded is false', () => {
    renderNavLink(false)
    expect(screen.queryByText('Import')).not.toBeInTheDocument()
  })

  it('applies the active (orange) class when the route matches', () => {
    renderNavLink(true, '/import')
    expect(screen.getByRole('link')).toHaveClass('bg-orange-500')
  })

  it('does not apply the active class when the route does not match', () => {
    renderNavLink(true, '/analyze')
    expect(screen.getByRole('link')).not.toHaveClass('bg-orange-500')
  })

  it('renders an anchor with the correct href', () => {
    renderNavLink(false)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/import')
  })
})
