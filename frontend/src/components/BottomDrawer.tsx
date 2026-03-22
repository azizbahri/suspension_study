import type { CalibrationProfile, SessionSummary } from '../services/types'

type BottomDrawerProps = {
  sessionSummary: SessionSummary
  profile: CalibrationProfile
}

export function BottomDrawer({ sessionSummary, profile }: BottomDrawerProps) {
  return (
    <section className="bottom-drawer">
      <div className="bottom-drawer__item">
        <p className="eyebrow">Session feed</p>
        <strong>{sessionSummary.sessionLabel}</strong>
        <p>
          {sessionSummary.sampleRateHz} Hz sample rate · {sessionSummary.durationSec.toFixed(1)} s
          captured · {sessionSummary.availableChannels} detected channels
        </p>
      </div>
      <div className="bottom-drawer__item">
        <p className="eyebrow">Calibration constants</p>
        <strong>{profile.frontTravelConfig.calibrationFactorMmPerVolt.toFixed(1)} mm/V front factor</strong>
        <p>
          Rear linkage model {profile.rearTravelConfig.linkageModelType} with{' '}
          {profile.rearTravelConfig.linkageCoefficients.length} coefficients ready for future drill-down.
        </p>
      </div>
      <div className="bottom-drawer__item">
        <p className="eyebrow">Cursor bus</p>
        <strong>Phase 2 will populate synchronized readouts here</strong>
        <p>The drawer exists now so graph expansion does not force a layout reset later.</p>
      </div>
    </section>
  )
}