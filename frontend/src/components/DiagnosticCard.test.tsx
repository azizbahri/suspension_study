import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DiagnosticCard from './DiagnosticCard'
import type { DiagnosticNote } from '../types/analysis'

const NOTE: DiagnosticNote = {
  rule_id: 'test_rule',
  severity: 'info',
  title: 'Test Title',
  message: 'Test message text.',
  action: 'Take this action.',
}

describe('DiagnosticCard', () => {
  it('renders the title, message and action for every severity', () => {
    render(<DiagnosticCard note={NOTE} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test message text.')).toBeInTheDocument()
    expect(screen.getByText('Take this action.')).toBeInTheDocument()
  })

  it('renders info severity with ℹ️ icon and "info" badge', () => {
    render(<DiagnosticCard note={{ ...NOTE, severity: 'info' }} />)
    expect(screen.getByText('ℹ️')).toBeInTheDocument()
    expect(screen.getByText('info')).toBeInTheDocument()
  })

  it('renders warning severity with ⚠️ icon and "warning" badge', () => {
    render(<DiagnosticCard note={{ ...NOTE, severity: 'warning' }} />)
    expect(screen.getByText('⚠️')).toBeInTheDocument()
    expect(screen.getByText('warning')).toBeInTheDocument()
  })

  it('renders critical severity with 🔴 icon and "critical" badge', () => {
    render(<DiagnosticCard note={{ ...NOTE, severity: 'critical' }} />)
    expect(screen.getByText('🔴')).toBeInTheDocument()
    expect(screen.getByText('critical')).toBeInTheDocument()
  })

  it('applies red border class for critical severity', () => {
    const { container } = render(<DiagnosticCard note={{ ...NOTE, severity: 'critical' }} />)
    expect(container.firstChild).toHaveClass('border-red-500')
  })

  it('applies yellow border class for warning severity', () => {
    const { container } = render(<DiagnosticCard note={{ ...NOTE, severity: 'warning' }} />)
    expect(container.firstChild).toHaveClass('border-yellow-400')
  })

  it('applies gray border class for info severity', () => {
    const { container } = render(<DiagnosticCard note={{ ...NOTE, severity: 'info' }} />)
    expect(container.firstChild).toHaveClass('border-gray-400')
  })
})
