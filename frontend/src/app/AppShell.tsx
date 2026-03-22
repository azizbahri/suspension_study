import type { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import { navItems } from './navigation'
import type { useMockWorkbench } from './useMockWorkbench'
import { BottomDrawer } from '../components/BottomDrawer'
import { StatusPanel } from '../components/StatusPanel'

type Workbench = ReturnType<typeof useMockWorkbench>

type AppShellProps = PropsWithChildren<{
  workbench: Workbench
}>

export function AppShell({ workbench, children }: AppShellProps) {
  const { sessionSummary, validationSummary, profile, importWarnings, diagnostics } =
    workbench.statusSnapshot

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar__brand">
          <div className="brand-mark" aria-hidden="true" />
          <div>
            <p className="eyebrow">Suspension DAQ / Phase 1</p>
            <h1>Import and Calibration Command Deck</h1>
            <p className="topbar-copy">
              Compact workflow shell for session intake, profile trust state, and downstream analysis readiness.
            </p>
          </div>
        </div>
        <div className="topbar-summary">
          <div>
            <span className="topbar-label">Session</span>
            <strong>{sessionSummary.sessionLabel}</strong>
          </div>
          <div>
            <span className="topbar-label">Profile</span>
            <strong>{profile.profileName}</strong>
          </div>
          <div>
            <span className="topbar-label">Validity</span>
            <strong>{validationSummary.overallValidity.replaceAll('_', ' ')}</strong>
          </div>
        </div>
      </header>

      <div className="workspace-grid">
        <nav className="nav-rail" aria-label="Main navigation">
          <div className="nav-rail__header">
            <p>Workflow rail</p>
            <span>Desktop shell with web-first delivery</span>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link--active' : 'nav-link'
              }
            >
              <span className="nav-link__step">{item.step}</span>
              <strong>{item.label}</strong>
            </NavLink>
          ))}
        </nav>

        <main className="main-panel">{children}</main>

        <StatusPanel
          sessionSummary={sessionSummary}
          validationSummary={validationSummary}
          profile={profile}
          importWarnings={importWarnings}
          diagnostics={diagnostics}
        />
      </div>

      <BottomDrawer sessionSummary={sessionSummary} profile={profile} />
    </div>
  )
}