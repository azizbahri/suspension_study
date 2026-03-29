import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Layout from './Layout'

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/import']}>
      <Layout>
        <div data-testid="page-content">hello</div>
      </Layout>
    </MemoryRouter>
  )
}

describe('Layout', () => {
  it('renders child content', () => {
    renderLayout()
    expect(screen.getByTestId('page-content')).toHaveTextContent('hello')
  })

  it('renders all four navigation links', async () => {
    const user = userEvent.setup()
    renderLayout()
    // Expand sidebar so link labels become visible and accessible
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const aside = document.querySelector('aside')!
    await user.hover(aside)
    expect(screen.getByRole('link', { name: /import/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /calibrate/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /analyze/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /compare/i })).toBeInTheDocument()
  })

  it('sidebar starts collapsed (w-16)', () => {
    renderLayout()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const aside = document.querySelector('aside')!
    expect(aside).toHaveClass('w-16')
    expect(aside).not.toHaveClass('w-60')
  })

  it('expands the sidebar on mouse enter', async () => {
    const user = userEvent.setup()
    renderLayout()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const aside = document.querySelector('aside')!
    await user.hover(aside)
    expect(aside).toHaveClass('w-60')
  })

  it('collapses the sidebar again on mouse leave', async () => {
    const user = userEvent.setup()
    renderLayout()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const aside = document.querySelector('aside')!
    await user.hover(aside)
    await user.unhover(aside)
    expect(aside).toHaveClass('w-16')
  })
})
