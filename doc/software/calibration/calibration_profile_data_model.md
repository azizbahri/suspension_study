# Calibration Profile Data Model

## Abstract

This document defines the data model for calibration profiles used by the suspension DAQ software. The purpose of the model is to make calibration data structured, auditable, versionable, and usable by every derived formula in the application. The model must support three things at once:

- numerical constants used by calculations,
- validity state used by the user interface and analysis engine,
- provenance used to explain where each value came from and how much confidence the software should place in it.

The calibration profile is therefore not just a settings bundle. It is a persisted engineering description of how raw logger channels are interpreted as physical measurements.

---

## 1. Design Goals

The calibration profile data model should satisfy the following goals:

- represent all constants required by the analysis formulas,
- preserve units and sign conventions,
- distinguish measured, fitted, estimated, and manually entered values,
- support partial profiles during setup,
- support validation and warning states,
- support future schema evolution without breaking older saved profiles.

---

## 2. Top-Level Profile Structure

At the highest level, a calibration profile should contain:

- profile identity,
- bike metadata,
- hardware channel mapping,
- formula-specific calibration sections,
- validation summary,
- provenance summary,
- revision metadata.

One possible conceptual structure is:

```text
CalibrationProfile
  profileId
  profileName
  schemaVersion
  bike
  channels
  frontTravel
  rearTravel
  velocityProcessing
  pitchProcessing
  histogramSettings
  validation
  provenance
  revision
```

---

## 3. Identity and Revision Fields

Every saved profile should include stable identity and revision information.

Required fields:

- `profileId`: unique identifier
- `profileName`: user-facing name
- `schemaVersion`: version of the profile schema
- `createdAt`: creation timestamp
- `updatedAt`: last modification timestamp
- `createdBy`: user or system source
- `revisionNumber`: incrementing revision counter
- `notes`: optional free-text engineering note

These fields let the software track evolution over time and migrate old profiles if the schema changes.

---

## 4. Bike Metadata Section

The bike metadata section should describe the machine the profile belongs to.

Suggested fields:

- `manufacturer`
- `model`
- `modelYear`
- `configurationName`
- `frontTravelMm`
- `rearTravelMm`
- `frontSensorType`
- `rearSensorType`
- `imuType`

This section gives physical context to the constants stored in the rest of the profile.

---

## 5. Channel Mapping Section

The channel mapping section defines which raw DAQ channels feed each calculation.

Suggested fields:

- `frontSensorChannel`
- `rearSensorChannel`
- `pitchGyroChannel`
- `longitudinalAccelChannel`
- `sampleRateHz`
- `timestampSource`

Each mapping should also include:

- `channelLabel`
- `rawUnit`
- `signConvention`
- `mappingValidity`

This is necessary because even a perfectly fitted constant is useless if it is attached to the wrong raw channel.

---

## 6. Formula-Specific Calibration Sections

Each major derived formula should have its own structured section.

### 6.1 Front Travel Section

The front travel section supports:

$$
W_{front} = (V_{raw,front} - V_{0,front}) \cdot C_{front} \cdot \cos(\theta)
$$

Suggested fields:

- `offsetVolts`
- `calibrationFactorMmPerVolt`
- `forkAngleDeg`
- `maxTravelMm`
- `compressionSign`
- `fitMetrics`
- `validity`
- `provenance`

### 6.2 Rear Travel Section

The rear travel section supports:

$$
s_{rear} = (V_{raw,rear} - V_{0,rear}) \cdot C_{rear}
$$

$$
W_{rear}(s_{rear}) = a s_{rear}^2 + b s_{rear} + c
$$

Suggested fields:

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

### 6.3 Velocity Processing Section

The velocity section supports:

$$
v_n \approx \frac{W_n - W_{n-1}}{\Delta t}
$$

Suggested fields:

- `sourceChannel`
- `sampleRateHz`
- `differentiationMethod`
- `preFilter`
- `postFilter`
- `velocitySign`
- `validity`
- `provenance`

### 6.4 Pitch Processing Section

The pitch section supports:

$$
\phi_n = \phi_{n-1} + \frac{\omega_{y,n} + \omega_{y,n-1}}{2} \Delta t
$$

Suggested fields:

- `gyroAxis`
- `gyroBias`
- `initialPitchDeg`
- `signConvention`
- `driftControl`
- `validity`
- `provenance`

### 6.5 Histogram Settings Section

Suggested fields:

- `frontTravelMaxMm`
- `rearTravelMaxMm`
- `binCount`
- `binWidth`
- `bottomOutThresholdPct`
- `topOutThresholdPct`
- `validity`

---

## 7. Validity-State Model

Every formula section should carry an explicit validity state. This state is consumed by the UI, the analytics layer, and any tuning interpretation logic.

Recommended values:

- `valid`
- `valid_estimated`
- `incomplete`
- `inconsistent`
- `failed_validation`
- `deprecated`

### 7.1 Meaning of Each State

- `valid`: all required fields are present and validation checks passed
- `valid_estimated`: usable, but one or more fields are estimated rather than measured or fitted
- `incomplete`: required inputs are missing
- `inconsistent`: required fields exist, but they conflict with observed data or known limits
- `failed_validation`: the model produced implausible output during checks
- `deprecated`: retained for history, but superseded by a newer profile or schema

### 7.2 State Propagation

The software should propagate section validity upward.

Examples:

- If `rearTravel.validity = incomplete`, rear travel histograms should not be shown as trusted outputs.
- If `velocityProcessing.validity = failed_validation`, the velocity histogram should remain visible only as a flagged provisional result.
- If any required channel mapping is invalid, dependent formula sections should inherit at least `incomplete` or `inconsistent` status.

---

## 8. Provenance Model

Every important constant should carry provenance metadata so the user can inspect how it was obtained.

Recommended provenance fields:

- `sourceType`
- `sourceDescription`
- `capturedAt`
- `capturedBy`
- `inputDataReference`
- `fitMethod`
- `fitPointCount`
- `fitResidual`
- `comments`

Recommended `sourceType` values:

- `measured`
- `fitted`
- `manual`
- `estimated`
- `imported`
- `copied`

### 8.1 Why Provenance Must Be Per Field

Provenance should not exist only at the profile level. Different parts of the same profile may come from different quality sources.

Example:

- front offset measured directly,
- rear linkage coefficients imported from previous sweep data,
- pitch initial reference estimated manually.

That means provenance should be attached both:

- to each formula section,
- and, where useful, to individual constants.

---

## 9. Validation Summary Section

The profile should also store a summary of the most recent validation pass.

Suggested fields:

- `overallValidity`
- `validatedAt`
- `validatedBy`
- `validationChecks`
- `warnings`
- `errors`
- `dependentViewsAffected`

This allows the software to explain why a profile is blocked, provisional, or trusted.

---

## 10. Suggested Conceptual JSON Shape

An illustrative structure could look like this:

```json
{
  "profileId": "t7-rear-001",
  "profileName": "T7 test bike baseline",
  "schemaVersion": 1,
  "bike": {
    "manufacturer": "Yamaha",
    "model": "Tenere 700",
    "frontTravelMm": 210,
    "rearTravelMm": 200
  },
  "channels": {
    "frontSensorChannel": "AIN0",
    "rearSensorChannel": "AIN1",
    "pitchGyroChannel": "GYRO_Y",
    "longitudinalAccelChannel": "ACCEL_X",
    "sampleRateHz": 250
  },
  "frontTravel": {
    "offsetVolts": 1.742,
    "calibrationFactorMmPerVolt": 51.3,
    "forkAngleDeg": 12.5,
    "validity": "valid",
    "provenance": {
      "sourceType": "fitted",
      "fitPointCount": 6,
      "fitResidual": 0.8
    }
  },
  "validation": {
    "overallValidity": "valid",
    "warnings": []
  }
}
```

This is illustrative rather than mandatory. The main requirement is that the structure be explicit, typed, and extendable.

---

## 11. Versioning and Migration

The profile model should be versioned from the beginning.

Requirements:

- every profile stores `schemaVersion`
- the software includes migration rules between versions
- migrated profiles preserve provenance and revision history
- deprecated fields remain readable long enough to avoid data loss during transitions

This matters because calibration capability will evolve as the software gains new analysis channels and UI workflows.

---

## 12. Conclusion

The calibration profile data model is the persistence layer behind the software's engineering credibility. It must store more than constants. It must also represent confidence, traceability, revision history, and dependency state. A well-designed model lets the software say not only what values it is using, but whether those values are trustworthy, how they were obtained, and which graphs or tuning conclusions should be treated as provisional.

That is the correct role of the data model in this product: to make calibration explicit, inspectable, and safe to use as the foundation for suspension analysis.