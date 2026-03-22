import { Badge } from './Badge'
import type {
  CalibrationProfile,
  SessionSummary,
  ValidationSummary,
} from '../services/types'

type StatusPanelProps = {
  sessionSummary: SessionSummary
  validationSummary: ValidationSummary
  profile: CalibrationProfile
  importWarnings: string[]
  diagnostics: string[]
}

function toneForValidity(validity: string): 'valid' | 'warning' | 'danger' | 'muted' {
  if (validity === 'valid') {
    return 'valid'
  }

  if (validity === 'valid_estimated' || validity === 'incomplete') {
    return 'warning'
  }

  if (validity === 'failed_validation' || validity === 'inconsistent') {
    return 'danger'
  }

  return 'muted'
}

export function StatusPanel({
  sessionSummary,
  validationSummary,
  profile,
  importWarnings,
  diagnostics,
}: StatusPanelProps) {
  return (
    <aside className="status-panel">
      <div className="status-panel__block">
        <p className="eyebrow">Trust state</p>
        <h2>Trust monitor</h2>
        <div className="stack-sm">
          <div className="status-row">
            <span>Session validity</span>
            <Badge label={sessionSummary.validityLabel} tone={toneForValidity(sessionSummary.validity)} />
          </div>
          <div className="status-row">
            <span>Calibration validity</span>
            <Badge
              label={validationSummary.overallValidity.replaceAll('_', ' ')}
              tone={toneForValidity(validationSummary.overallValidity)}
            />
          </div>
          <div className="status-row">
            <span>Active profile</span>
            <strong>{profile.profileName}</strong>
          </div>
        </div>
      </div>

      <div className="status-panel__block">
        <h3>Warnings</h3>
        <ul className="plain-list">
          {[...importWarnings, ...validationSummary.warnings].map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      </div>

      <div className="status-panel__block">
        <h3>Next actions</h3>
        <ul className="plain-list">
          {validationSummary.recommendedActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>

      <div className="status-panel__block">
        <h3>Provenance</h3>
        <ul className="plain-list compact-list">
          <li>Front travel: {profile.frontTravelConfig.provenance.sourceType}</li>
          <li>Rear travel: {profile.rearTravelConfig.provenance.sourceType}</li>
          <li>Velocity: {profile.velocityProcessingConfig.provenance.sourceType}</li>
          <li>Pitch: {profile.pitchProcessingConfig.provenance.sourceType}</li>
        </ul>
      </div>

      <div className="status-panel__block">
        <h3>Import diagnostics</h3>
        <ul className="plain-list compact-list">
          {diagnostics.map((diagnostic) => (
            <li key={diagnostic}>{diagnostic}</li>
          ))}
        </ul>
      </div>
    </aside>
  )
}