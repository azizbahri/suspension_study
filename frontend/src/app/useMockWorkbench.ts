import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AppState } from './state'
import { mockProfiles, mockSessionScenarios } from '../services/mockApi'

export function useMockWorkbench(initialState: AppState) {
  const [state, setState] = useState(initialState)
  const navigate = useNavigate()

  const activeScenario = useMemo(
    () =>
      mockSessionScenarios.find((scenario) => scenario.id === state.activeScenarioId) ??
      mockSessionScenarios[0],
    [state.activeScenarioId],
  )

  const activeProfile = useMemo(
    () =>
      mockProfiles.find((profile) => profile.profileId === state.activeProfileId) ??
      mockProfiles[0],
    [state.activeProfileId],
  )

  const selectScenario = (scenarioId: string) => {
    const nextScenario = mockSessionScenarios.find((scenario) => scenario.id === scenarioId)

    if (!nextScenario) {
      return
    }

    setState((current) => ({
      ...current,
      activeScenarioId: scenarioId,
      importState: nextScenario.result,
    }))
  }

  const selectProfile = (profileId: string) => {
    const nextProfile = mockProfiles.find((profile) => profile.profileId === profileId)

    if (!nextProfile) {
      return
    }

    setState((current) => ({
      ...current,
      activeProfileId: profileId,
      calibrationState: {
        profile: nextProfile,
        validationSummary: nextProfile.validationSummary,
      },
    }))
  }

  const goToCalibration = () => {
    navigate('/calibration')
  }

  return {
    sessionScenarios: mockSessionScenarios,
    profileChoices: mockProfiles,
    activeScenarioId: state.activeScenarioId,
    activeProfileId: state.activeProfileId,
    importState: activeScenario.result,
    calibrationState: state.calibrationState,
    selectScenario,
    selectProfile,
    goToCalibration,
    analysisReadinessLabel:
      activeProfile.validationSummary.overallValidity === 'valid'
        ? 'Ready for travel histogram and telemetry integration once the analysis contract lands'
        : 'Blocked until profile validity improves or provisional rendering rules are approved',
    statusSnapshot: {
      sessionSummary: activeScenario.result.sessionSummary,
      validationSummary: state.calibrationState.validationSummary,
      profile: activeProfile,
      importWarnings: activeScenario.result.importWarnings,
      diagnostics: activeScenario.result.importDiagnostics,
    },
  }
}