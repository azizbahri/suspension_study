import { Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { createInitialAppState } from './app/state'
import { useMockWorkbench } from './app/useMockWorkbench'
import { CalibrationWorkspace } from './screens/CalibrationWorkspace'
import { ImportWorkspace } from './screens/ImportWorkspace'
import { PlaceholderWorkspace } from './screens/PlaceholderWorkspace'

function App() {
  const workbench = useMockWorkbench(createInitialAppState())

  return (
    <AppShell workbench={workbench}>
      <Routes>
        <Route
          path="/"
          element={
            <ImportWorkspace
              scenarios={workbench.sessionScenarios}
              activeScenarioId={workbench.activeScenarioId}
              importState={workbench.importState}
              onScenarioSelect={workbench.selectScenario}
              onProceedToCalibration={workbench.goToCalibration}
            />
          }
        />
        <Route
          path="/calibration"
          element={
            <CalibrationWorkspace
              profileChoices={workbench.profileChoices}
              activeProfileId={workbench.activeProfileId}
              calibrationState={workbench.calibrationState}
              onProfileSelect={workbench.selectProfile}
            />
          }
        />
        <Route
          path="/analysis"
          element={
            <PlaceholderWorkspace
              title="Analysis workspace"
              eyebrow="Phase 2"
              description="Travel histograms, telemetry traces, and graph-level warnings are intentionally deferred until the import and calibration contract boundary is stable."
              readinessLabel={workbench.analysisReadinessLabel}
              checklist={[
                'Imported session with a usable channel map',
                'Attached profile with visible per-section trust state',
                'Backend graph payload contract frozen',
              ]}
            />
          }
        />
        <Route
          path="/compare"
          element={
            <PlaceholderWorkspace
              title="Comparison workspace"
              eyebrow="Phase 4"
              description="Overlay and delta workflows stay out of the first slice so the baseline session, profile validity, and trust presentation can be proven first."
              readinessLabel="Requires completed analysis outputs for two sessions"
              checklist={[
                'Baseline analysis result available',
                'Comparison analysis result available',
                'Alignment and delta statistics contract defined',
              ]}
            />
          }
        />
        <Route
          path="/session-details"
          element={
            <PlaceholderWorkspace
              title="Session details"
              eyebrow="Future detail view"
              description="This route will surface raw import diagnostics, source metadata, and formula provenance without forcing users out of the main workflow."
              readinessLabel="Current slice keeps these details in the persistent status panel"
              checklist={[
                'Session metadata persisted',
                'Formula provenance linked to backend summaries',
                'Diagnostic drill-down interactions defined',
              ]}
            />
          }
        />
      </Routes>
    </AppShell>
  )
}

export default App
