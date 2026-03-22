# Suspension DAQ Backend Data Structures

## Abstract

This document defines the canonical backend-side data structures that should support the suspension DAQ product. These structures sit below the software-design notes and above storage and transport details. Their purpose is to make the analysis engine, persistence layer, and frontend integration speak the same domain language.

The backend should represent the product through a small number of explicit object families:

- session objects,
- calibration objects,
- validation objects,
- analysis objects,
- comparison objects,
- interpretation objects.

---

## 1. Design Goals

The data structures should:

- preserve engineering meaning and units,
- separate persisted state from derived state,
- support partial and provisional validity,
- preserve provenance and revision history,
- map cleanly to API payloads,
- remain stable even if transport or UI frameworks change.

---

## 2. Object Relationship Overview

The core backend object graph should follow this pattern:

```text
SessionRecord
  -> ChannelDescriptor[]
  -> CalibrationProfile
  -> ValidationSummary
  -> AnalysisResult[]

AnalysisResult
  -> DerivedSeries[]
  -> HistogramResult[]
  -> SummaryStatistics
  -> InterpretationSummary

ComparisonResult
  -> AnalysisResult reference A
  -> AnalysisResult reference B
  -> DeltaStatistics
  -> InterpretationSummary
```

This keeps the system explicit about what is persisted, what is computed, and what is being compared.

---

## 3. Session Objects

### 3.1 SessionRecord

`SessionRecord` is the canonical object representing one imported DAQ session.

Required fields:

- `sessionId`
- `sourceFile`
- `importedAt`
- `sampleRateHz`
- `durationSec`
- `timestampMode`
- `channelDescriptors`
- `importStatus`
- `importDiagnostics`
- `assignedProfileId`
- `sessionValidity`

Responsibilities:

- identify the session,
- preserve source and timing context,
- expose import readiness to the rest of the system.

### 3.2 ChannelDescriptor

`ChannelDescriptor` defines one raw DAQ channel.

Required fields:

- `channelKey`
- `channelLabel`
- `rawUnit`
- `sampleCount`
- `signConvention`
- `detectedRole`
- `mappingState`
- `notes`

This object is important because wrong channel identity invalidates every downstream result.

---

## 4. Calibration Objects

### 4.1 CalibrationProfile

`CalibrationProfile` is the canonical persisted engineering description used to transform raw channels into physical values.

Required fields:

- `profileId`
- `profileName`
- `schemaVersion`
- `bikeMetadata`
- `channelMapping`
- `frontTravelConfig`
- `rearTravelConfig`
- `velocityProcessingConfig`
- `pitchProcessingConfig`
- `histogramSettings`
- `validationSummary`
- `provenanceSummary`
- `revisionMetadata`

This structure should match the conceptual design in [../software/calibration/calibration_profile_data_model.md](../software/calibration/calibration_profile_data_model.md), but in implementation terms it becomes the actual canonical object used by services.

### 4.2 BikeMetadata

Required fields:

- `manufacturer`
- `model`
- `modelYear`
- `configurationName`
- `frontTravelMm`
- `rearTravelMm`
- `sensorPackage`

### 4.3 ChannelMapping

Required fields:

- `frontSensorChannel`
- `rearSensorChannel`
- `pitchGyroChannel`
- `longitudinalAccelChannel`
- `sampleRateHz`
- `mappingValidity`

### 4.4 FrontTravelConfig

Required fields:

- `offsetVolts`
- `calibrationFactorMmPerVolt`
- `forkAngleDeg`
- `maxTravelMm`
- `compressionSign`
- `fitMetrics`
- `validity`
- `provenance`

### 4.5 RearTravelConfig

Required fields:

- `offsetVolts`
- `calibrationFactorMmPerVolt`
- `linkageModelType`
- `linkageCoefficients`
- `maxTravelMm`
- `compressionSign`
- `sensorFitMetrics`
- `linkageFitMetrics`
- `validity`
- `provenance`

### 4.6 VelocityProcessingConfig

Required fields:

- `sourceChannel`
- `differentiationMethod`
- `preFilter`
- `postFilter`
- `sampleRateHz`
- `validity`
- `provenance`

### 4.7 PitchProcessingConfig

Required fields:

- `gyroAxis`
- `gyroBias`
- `initialPitchDeg`
- `signConvention`
- `driftControl`
- `validity`
- `provenance`

### 4.8 HistogramSettings

Required fields:

- `frontTravelMaxMm`
- `rearTravelMaxMm`
- `binCount`
- `binWidth`
- `bottomOutThresholdPct`
- `topOutThresholdPct`
- `validity`

---

## 5. Validation Objects

### 5.1 ValidationSummary

`ValidationSummary` is the canonical trust object used throughout the system.

Required fields:

- `overallValidity`
- `sectionValidity`
- `warnings`
- `errors`
- `recommendedActions`
- `evaluatedAt`

This should exist both at profile level and at analysis-result level.

### 5.2 ProvenanceSummary

Required fields:

- `sourceType`
- `sourceReference`
- `method`
- `measuredAt`
- `confidenceNote`

The backend should retain provenance as structured data rather than flattening it into plain text.

---

## 6. Analysis Objects

### 6.1 AnalysisRequest

Required fields:

- `sessionId`
- `profileId`
- `requestedOutputs`
- `segmentSelection`
- `displayOptions`

This object is not persisted permanently by default, but it should be represented explicitly so analysis runs remain traceable.

### 6.2 AnalysisResult

`AnalysisResult` is the canonical output object for a computed session analysis.

Required fields:

- `analysisId`
- `sessionId`
- `profileId`
- `derivedSeries`
- `histograms`
- `summaryStatistics`
- `validationSummary`
- `warnings`
- `interpretationSummary`
- `generatedAt`

### 6.3 DerivedSeries

Required fields:

- `seriesKey`
- `label`
- `unit`
- `sampleCount`
- `xAxis`
- `values`
- `seriesValidity`
- `sourceDependencies`

Suggested series include:

- front travel,
- rear travel,
- front velocity,
- rear velocity,
- pitch angle,
- longitudinal acceleration.

### 6.4 HistogramResult

Required fields:

- `histogramKey`
- `label`
- `binEdges`
- `binCenters`
- `counts`
- `percentages`
- `markers`
- `histogramValidity`
- `sourceSeriesKey`

This lets the frontend render histograms without reconstructing the underlying occupancy logic.

### 6.5 SummaryStatistics

Required fields:

- `travelMetrics`
- `velocityMetrics`
- `pitchMetrics`
- `eventMetrics`
- `analysisNotes`

---

## 7. Comparison Objects

### 7.1 ComparisonRequest

Required fields:

- `baselineSessionId`
- `comparisonSessionId`
- `baselineProfileId`
- `comparisonProfileId`
- `alignmentMode`
- `requestedOutputs`

### 7.2 ComparisonResult

Required fields:

- `comparisonId`
- `baselineReference`
- `comparisonReference`
- `alignedOutputs`
- `deltaStatistics`
- `validationSummary`
- `warnings`
- `interpretationSummary`
- `generatedAt`

### 7.3 DeltaStatistics

Required fields:

- `travelOccupancyDelta`
- `velocityDistributionDelta`
- `pitchBehaviorDelta`
- `confidenceNotes`

---

## 8. Interpretation Objects

### 8.1 InterpretationSummary

Required fields:

- `observations`
- `possibleCauses`
- `confidence`
- `gatingWarnings`
- `suggestedReviewAreas`

This object should be clearly separated from raw analysis data so the product can evolve from simple rule-based guidance toward more advanced AI-assisted interpretation later.

---

## 9. Persistence Versus Transport Boundaries

Not every object should be stored exactly as transmitted.

Recommended split:

- persist `SessionRecord`, `CalibrationProfile`, and selected `AnalysisResult` summaries,
- optionally persist full derived arrays only when needed for caching or reproducibility,
- shape API responses from these canonical objects rather than making transport models the system of record.

This prevents transport decisions from corrupting the internal engineering model.

---

## 10. Tie Between Backend and Frontend

The frontend should consume these structures through the API contract, but should not own them.

The practical mapping is:

- import view consumes `SessionRecord` and `ChannelDescriptor`,
- calibration view consumes `CalibrationProfile` and `ValidationSummary`,
- analysis view consumes `AnalysisResult`, `DerivedSeries`, and `HistogramResult`,
- comparison view consumes `ComparisonResult` and `DeltaStatistics`,
- status panel consumes `ValidationSummary` and `ProvenanceSummary`.

This is the key mechanism that ties backend truth to UI behavior.

---

## 11. Conclusion

The backend should be built around a small set of canonical engineering objects rather than ad hoc endpoint payloads. If these structures remain stable, the implementation can evolve from local MVP to richer desktop product and later cloud deployment without rewriting the system's core meaning.