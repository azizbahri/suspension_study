import { Badge } from '../components/Badge'
import { SectionCard } from '../components/SectionCard'
import type { CalibrationProfile, ValidationSummary } from '../services/types'

type CalibrationWorkspaceProps = {
  profileChoices: CalibrationProfile[]
  activeProfileId: string
  calibrationState: {
    profile: CalibrationProfile
    validationSummary: ValidationSummary
  }
  onProfileSelect: (profileId: string) => void
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

export function CalibrationWorkspace({
  profileChoices,
  activeProfileId,
  calibrationState,
  onProfileSelect,
}: CalibrationWorkspaceProps) {
  const { profile, validationSummary } = calibrationState

  return (
    <div className="workspace-stack">
      <SectionCard
        title="Calibration setup"
        eyebrow="Profile workflow"
        description="This slice stops at profile selection, section trust state, and validation guidance. Detailed editors stay deferred until the contract boundary is stable."
        actions={
          <div className="action-row">
            <button className="secondary-button" type="button">
              New profile
            </button>
            <button className="primary-button" type="button">
              Save profile
            </button>
          </div>
        }
      >
        <div className="calibration-hero">
          <div>
            <label className="field-label" htmlFor="profile-select">
              Active profile
            </label>
            <select
              id="profile-select"
              className="select-input"
              value={activeProfileId}
              onChange={(event) => onProfileSelect(event.target.value)}
            >
              {profileChoices.map((profileChoice) => (
                <option key={profileChoice.profileId} value={profileChoice.profileId}>
                  {profileChoice.profileName}
                </option>
              ))}
            </select>
          </div>
          <div className="calibration-hero__badges">
            <Badge
              label={validationSummary.overallValidity.replaceAll('_', ' ')}
              tone={toneForValidity(validationSummary.overallValidity)}
            />
            <Badge label={`Revision ${profile.revisionMetadata.revision}`} tone="muted" />
          </div>
        </div>
      </SectionCard>

      <div className="split-panel">
        <SectionCard title="Bike and channel mapping">
          <dl className="data-grid">
            <div>
              <dt>Bike</dt>
              <dd>
                {profile.bikeMetadata.modelYear} {profile.bikeMetadata.manufacturer}{' '}
                {profile.bikeMetadata.model}
              </dd>
            </div>
            <div>
              <dt>Configuration</dt>
              <dd>{profile.bikeMetadata.configurationName}</dd>
            </div>
            <div>
              <dt>Front sensor channel</dt>
              <dd>{profile.channelMapping.frontSensorChannel}</dd>
            </div>
            <div>
              <dt>Rear sensor channel</dt>
              <dd>{profile.channelMapping.rearSensorChannel}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Validation summary">
          <ul className="plain-list">
            {validationSummary.recommendedActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Per-section calibration status" description="Measured-versus-estimated provenance stays explicit so no later graph appears more trustworthy than its source constants.">
        <div className="status-card-grid">
          <article className="status-card">
            <header>
              <p className="eyebrow">Front travel</p>
              <Badge label={profile.frontTravelConfig.validity} tone={toneForValidity(profile.frontTravelConfig.validity)} />
            </header>
            <strong>{profile.frontTravelConfig.calibrationFactorMmPerVolt.toFixed(1)} mm/V</strong>
            <p>
              Offset {profile.frontTravelConfig.offsetVolts.toFixed(2)} V · fork angle{' '}
              {profile.frontTravelConfig.forkAngleDeg.toFixed(1)} deg
            </p>
          </article>

          <article className="status-card">
            <header>
              <p className="eyebrow">Rear travel</p>
              <Badge label={profile.rearTravelConfig.validity} tone={toneForValidity(profile.rearTravelConfig.validity)} />
            </header>
            <strong>{profile.rearTravelConfig.linkageModelType}</strong>
            <p>
              {profile.rearTravelConfig.linkageCoefficients.length} linkage coefficients · max{' '}
              {profile.rearTravelConfig.maxTravelMm} mm
            </p>
          </article>

          <article className="status-card">
            <header>
              <p className="eyebrow">Velocity processing</p>
              <Badge
                label={profile.velocityProcessingConfig.validity}
                tone={toneForValidity(profile.velocityProcessingConfig.validity)}
              />
            </header>
            <strong>{profile.velocityProcessingConfig.differentiationMethod}</strong>
            <p>
              Pre-filter {profile.velocityProcessingConfig.preFilter.type} · post-filter{' '}
              {profile.velocityProcessingConfig.postFilter.type}
            </p>
          </article>

          <article className="status-card">
            <header>
              <p className="eyebrow">Pitch processing</p>
              <Badge label={profile.pitchProcessingConfig.validity} tone={toneForValidity(profile.pitchProcessingConfig.validity)} />
            </header>
            <strong>{profile.pitchProcessingConfig.gyroAxis}</strong>
            <p>
              Bias {profile.pitchProcessingConfig.gyroBias.toFixed(3)} deg/s · initial pitch{' '}
              {profile.pitchProcessingConfig.initialPitchDeg.toFixed(1)} deg
            </p>
          </article>
        </div>
      </SectionCard>

      <SectionCard title="Calibration tool entry points" description="Reserved shells for fit plots, residual review, and save workflows once detailed calibration tooling begins.">
        <div className="tool-grid">
          {[
            'Front travel tool',
            'Rear travel tool',
            'Velocity processing tool',
            'Pitch processing tool',
          ].map((tool) => (
            <article className="tool-card" key={tool}>
              <p className="eyebrow">Planned detail screen</p>
              <strong>{tool}</strong>
              <p>Reserved for fit plots, residual review, provenance capture, and save workflows.</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}