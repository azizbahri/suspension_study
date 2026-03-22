import type {
  CalibrationProfile,
  SessionImportResult,
  ValidationSummary,
} from '../services/types'
import { mockProfiles, mockSessionScenarios } from '../services/mockApi'

export type AppState = {
  activeScenarioId: string
  activeProfileId: string
  importState: SessionImportResult
  calibrationState: {
    profile: CalibrationProfile
    validationSummary: ValidationSummary
  }
}

export function createInitialAppState(): AppState {
  const defaultScenario = mockSessionScenarios[0]
  const defaultProfile = mockProfiles[0]

  return {
    activeScenarioId: defaultScenario.id,
    activeProfileId: defaultProfile.profileId,
    importState: defaultScenario.result,
    calibrationState: {
      profile: defaultProfile,
      validationSummary: defaultProfile.validationSummary,
    },
  }
}