import { Badge } from '../components/Badge'
import { SectionCard } from '../components/SectionCard'
import type { MockScenario, SessionImportResult } from '../services/types'

type ImportWorkspaceProps = {
  scenarios: MockScenario[]
  activeScenarioId: string
  importState: SessionImportResult
  onScenarioSelect: (scenarioId: string) => void
  onProceedToCalibration: () => void
}

function toneForStatus(status: SessionImportResult['status']): 'valid' | 'warning' | 'danger' {
  if (status === 'ready') {
    return 'valid'
  }

  if (status === 'warning') {
    return 'warning'
  }

  return 'danger'
}

export function ImportWorkspace({
  scenarios,
  activeScenarioId,
  importState,
  onScenarioSelect,
  onProceedToCalibration,
}: ImportWorkspaceProps) {
  return (
    <div className="workspace-stack">
      <SectionCard
        title="Session import"
        eyebrow="Phase 1 workflow"
        description="Mock contract states prove the intake flow, warning visibility, and trust rendering before the Python import service is wired."
        actions={
          <button className="primary-button" onClick={onProceedToCalibration} type="button">
            Proceed to calibration
          </button>
        }
      >
        <div className="hero-panel">
          <div>
            <p className="eyebrow">DAQ intake</p>
            <h3>Validate one session quickly</h3>
            <p>
              Keep the operator loop tight: import, inspect channel identity, review diagnostics, then move straight into profile attachment.
            </p>
          </div>
          <div className="dropzone-card" role="presentation">
            <strong>Drag .csv or logger export here</strong>
            <span>Browse and hardware-linked acquisition will attach to this same panel later.</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Import scenarios" description="Cycle through ready, flagged, and blocked payloads to verify the shell behavior before backend integration.">
        <div className="scenario-grid">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              className={scenario.id === activeScenarioId ? 'scenario-card scenario-card--active' : 'scenario-card'}
              onClick={() => onScenarioSelect(scenario.id)}
              type="button"
            >
              <p className="eyebrow">{scenario.eyebrow}</p>
              <strong>{scenario.label}</strong>
              <span>{scenario.summary}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="split-panel">
        <SectionCard title="Session metadata" actions={<Badge label={importState.status} tone={toneForStatus(importState.status)} />}>
          <dl className="data-grid">
            <div>
              <dt>Session label</dt>
              <dd>{importState.sessionSummary.sessionLabel}</dd>
            </div>
            <div>
              <dt>Source file</dt>
              <dd>{importState.sessionSummary.sourceFile}</dd>
            </div>
            <div>
              <dt>Sample rate</dt>
              <dd>{importState.sessionSummary.sampleRateHz} Hz</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{importState.sessionSummary.durationSec.toFixed(1)} s</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Import warnings">
          <ul className="plain-list">
            {importState.importWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Detected channel table" description="Channel role, sign convention, and mapping state stay visible because a bad identity breaks every downstream result.">
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Channel</th>
                <th>Role</th>
                <th>Unit</th>
                <th>Sign</th>
                <th>Mapping</th>
              </tr>
            </thead>
            <tbody>
              {importState.channelDescriptors.map((channel) => (
                <tr key={channel.channelKey}>
                  <td>
                    <strong>{channel.channelLabel}</strong>
                    <span>{channel.notes}</span>
                  </td>
                  <td>{channel.detectedRole}</td>
                  <td>{channel.rawUnit}</td>
                  <td>{channel.signConvention}</td>
                  <td>{channel.mappingState}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}