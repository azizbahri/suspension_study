export type ValidityState =
  | 'valid'
  | 'valid_estimated'
  | 'incomplete'
  | 'inconsistent'
  | 'failed_validation'
  | 'deprecated'

export type MappingState = 'mapped' | 'needs-review' | 'missing'

export type ProvenanceSummary = {
  sourceType: 'measured' | 'fitted' | 'estimated' | 'imported'
  sourceReference: string
  method: string
  measuredAt: string
  confidenceNote: string
}

export type ValidationSummary = {
  overallValidity: ValidityState
  sectionValidity: Record<string, ValidityState>
  warnings: string[]
  errors: string[]
  recommendedActions: string[]
  evaluatedAt: string
}

export type SessionSummary = {
  sessionLabel: string
  sourceFile: string
  sampleRateHz: number
  durationSec: number
  availableChannels: number
  validity: ValidityState
  validityLabel: string
}

export type ChannelDescriptor = {
  channelKey: string
  channelLabel: string
  rawUnit: string
  sampleCount: number
  signConvention: string
  detectedRole: string
  mappingState: MappingState
  notes: string
}

export type SessionImportResult = {
  sessionId: string
  status: 'ready' | 'warning' | 'failed'
  sessionSummary: SessionSummary
  channelDescriptors: ChannelDescriptor[]
  importWarnings: string[]
  importDiagnostics: string[]
}

export type FilterConfig = {
  type: string
  cutoffHz: number
  order: number
}

export type FrontTravelConfig = {
  offsetVolts: number
  calibrationFactorMmPerVolt: number
  forkAngleDeg: number
  maxTravelMm: number
  compressionSign: string
  fitMetrics: string
  validity: ValidityState
  provenance: ProvenanceSummary
}

export type RearTravelConfig = {
  offsetVolts: number
  calibrationFactorMmPerVolt: number
  linkageModelType: string
  linkageCoefficients: number[]
  maxTravelMm: number
  compressionSign: string
  sensorFitMetrics: string
  linkageFitMetrics: string
  validity: ValidityState
  provenance: ProvenanceSummary
}

export type VelocityProcessingConfig = {
  sourceChannel: string
  differentiationMethod: string
  preFilter: FilterConfig
  postFilter: FilterConfig
  sampleRateHz: number
  validity: ValidityState
  provenance: ProvenanceSummary
}

export type PitchProcessingConfig = {
  gyroAxis: string
  gyroBias: number
  initialPitchDeg: number
  signConvention: string
  driftControl: string
  validity: ValidityState
  provenance: ProvenanceSummary
}

export type HistogramSettings = {
  frontTravelMaxMm: number
  rearTravelMaxMm: number
  binCount: number
  binWidth: number
  bottomOutThresholdPct: number
  topOutThresholdPct: number
  validity: ValidityState
}

export type CalibrationProfile = {
  profileId: string
  profileName: string
  schemaVersion: string
  bikeMetadata: {
    manufacturer: string
    model: string
    modelYear: number
    configurationName: string
    frontTravelMm: number
    rearTravelMm: number
    sensorPackage: string
  }
  channelMapping: {
    frontSensorChannel: string
    rearSensorChannel: string
    pitchGyroChannel: string
    longitudinalAccelChannel: string
    sampleRateHz: number
    mappingValidity: ValidityState
  }
  frontTravelConfig: FrontTravelConfig
  rearTravelConfig: RearTravelConfig
  velocityProcessingConfig: VelocityProcessingConfig
  pitchProcessingConfig: PitchProcessingConfig
  histogramSettings: HistogramSettings
  validationSummary: ValidationSummary
  provenanceSummary: ProvenanceSummary
  revisionMetadata: {
    revision: number
    updatedAt: string
    updatedBy: string
  }
}

export type MockScenario = {
  id: string
  label: string
  eyebrow: string
  summary: string
  result: SessionImportResult
}