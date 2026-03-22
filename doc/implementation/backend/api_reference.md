# Suspension DAQ Backend API Reference

## Overview

This document defines the backend APIs that should exist for the suspension DAQ software. It is intended to serve as the backend API reference for implementation and later maintenance.

The API surface is organized around the core backend workflow:

```text
import session
  -> inspect channels
  -> create or load calibration profile
  -> validate profile and session
  -> run analysis
  -> compare sessions
```

The goal is to define a stable backend contract before implementation expands.

## Design Intent

The API should satisfy the following design goals:

- keep calibration and analytical logic in the Python backend,
- expose stable request-response boundaries to the frontend,
- return render-ready graph payloads,
- propagate validity, warnings, and confidence explicitly,
- remain usable in a local desktop deployment first,
- remain portable to future remote deployment.

## Transport Model

The recommended MVP transport is a local HTTP API implemented in Python, most likely with FastAPI. The logical API surface should remain valid even if transport later shifts.

Recommended assumptions:

- JSON request and response bodies,
- local service during MVP,
- versioned API prefix, for example `/api/v1`,
- backend remains authoritative for engineering outputs.

## API Domains

The backend API is divided into six domains:

- session import,
- session retrieval,
- calibration profile management,
- validation,
- analysis,
- comparison.

## Endpoint Summary

The minimum useful endpoint set is:

- `POST /api/v1/sessions/import`
- `GET /api/v1/sessions/{session_id}`
- `GET /api/v1/sessions`
- `POST /api/v1/profiles`
- `PUT /api/v1/profiles/{profile_id}`
- `GET /api/v1/profiles/{profile_id}`
- `GET /api/v1/profiles`
- `POST /api/v1/profiles/{profile_id}/validate`
- `POST /api/v1/analysis`
- `GET /api/v1/analysis/{analysis_id}`
- `POST /api/v1/comparisons`
- `GET /api/v1/comparisons/{comparison_id}`

## Session APIs

### `POST /api/v1/sessions/import`

Purpose:

- import a DAQ file into the backend,
- detect channels,
- create a session record,
- return import diagnostics.

Request body:

- `sourceFile`
- `formatHint` (optional)
- `delimiter` (optional)
- `bikeContext` (optional)
- `loggerContext` (optional)

Response body:

- `sessionId`
- `status`
- `sessionSummary`
- `channelDescriptors`
- `importWarnings`
- `importDiagnostics`

Notes:

- the backend owns file parsing,
- the frontend should not parse DAQ file formats itself,
- the response should be sufficient to render the import screen immediately.

### `GET /api/v1/sessions/{session_id}`

Purpose:

- return a single session record and its current metadata.

Response body:

- `sessionId`
- `sourceFile`
- `sampleRateHz`
- `durationSec`
- `channelDescriptors`
- `assignedProfileId`
- `sessionValidity`
- `importDiagnostics`

### `GET /api/v1/sessions`

Purpose:

- list imported sessions for selection and comparison workflows.

Response body:

- `sessions`

Each listed session should include:

- `sessionId`
- `displayName`
- `sampleRateHz`
- `durationSec`
- `assignedProfileId`
- `sessionValidity`

## Profile APIs

### `POST /api/v1/profiles`

Purpose:

- create a new calibration profile.

Request body:

- profile identity,
- bike metadata,
- channel mapping,
- front travel configuration,
- rear travel configuration,
- velocity processing configuration,
- pitch processing configuration,
- histogram settings.

Response body:

- full `CalibrationProfile`

### `PUT /api/v1/profiles/{profile_id}`

Purpose:

- update an existing calibration profile.

Request body:

- the same logical fields as profile creation,
- optionally partial section updates if supported.

Response body:

- updated `CalibrationProfile`

### `GET /api/v1/profiles/{profile_id}`

Purpose:

- retrieve a single calibration profile.

Response body:

- full `CalibrationProfile`

### `GET /api/v1/profiles`

Purpose:

- list saved calibration profiles.

Response body:

- `profiles`

Each listed profile should include:

- `profileId`
- `profileName`
- `schemaVersion`
- `bikeMetadata` summary
- `validationSummary` summary
- `revisionMetadata` summary

## Validation APIs

### `POST /api/v1/profiles/{profile_id}/validate`

Purpose:

- validate a calibration profile on its own,
- optionally validate it against a specific imported session.

Request body:

- `sessionId` (optional)
- `validationMode` (optional)

Response body:

- `ValidationSummary`

Expected fields:

- `overallValidity`
- `sectionValidity`
- `warnings`
- `errors`
- `recommendedActions`

## Analysis APIs

### `POST /api/v1/analysis`

Purpose:

- run a single-session engineering analysis.

Request body:

- `sessionId`
- `profileId`
- `requestedOutputs`
- `segmentSelection` (optional)
- `displayOptions` (optional)

Response body:

- `AnalysisResult`

Expected fields:

- `analysisId`
- `sessionId`
- `profileId`
- `derivedSeries`
- `histograms`
- `summaryStatistics`
- `validationSummary`
- `warnings`
- `interpretationSummary`
- `confidence`

Notes:

- this endpoint should return render-ready histogram and telemetry payloads,
- the frontend should not compute histograms from raw arrays unless specifically delegated,
- the backend should attach validity information to each analysis output family.

### `GET /api/v1/analysis/{analysis_id}`

Purpose:

- retrieve a previously generated analysis result.

Response body:

- full `AnalysisResult` or cached summary depending on storage strategy.

## Comparison APIs

### `POST /api/v1/comparisons`

Purpose:

- compare two sessions or two analysis contexts.

Request body:

- `baselineSessionId`
- `comparisonSessionId`
- `baselineProfileId`
- `comparisonProfileId`
- `alignmentMode`
- `requestedOutputs`

Response body:

- `ComparisonResult`

Expected fields:

- `comparisonId`
- `baselineReference`
- `comparisonReference`
- `alignedOutputs`
- `deltaStatistics`
- `validationSummary`
- `warnings`
- `interpretationSummary`
- `generatedAt`

### `GET /api/v1/comparisons/{comparison_id}`

Purpose:

- retrieve a previously generated comparison result.

Response body:

- full `ComparisonResult` or cached summary depending on storage strategy.

## Canonical Payload Families

The backend should expose a consistent set of object families across these APIs.

Core object families:

- `SessionRecord`
- `ChannelDescriptor`
- `CalibrationProfile`
- `ValidationSummary`
- `AnalysisResult`
- `DerivedSeries`
- `HistogramResult`
- `ComparisonResult`
- `DeltaStatistics`
- `InterpretationSummary`

These should align with the canonical models described in [../backend_data_structures.md](../backend_data_structures.md).

## Error Model

The backend should distinguish between hard failures and usable-but-flagged outputs.

Hard failures should be used when:

- the file cannot be parsed,
- required identifiers are missing,
- a requested operation cannot execute,
- stored objects do not exist.

Warnings should be used when:

- estimated constants are present,
- one output family is provisional,
- fit quality is weak,
- timing or channel quality is suspect,
- interpretation confidence is gated by incomplete upstream inputs.

## Validity Propagation

The backend should propagate validity in this order:

```text
channel mapping validity
  -> calibration section validity
  -> derived channel validity
  -> graph payload validity
  -> interpretation confidence
```

The frontend should receive this explicitly through API payloads rather than inferring it from missing fields.

## Versioning Notes

The API should be versioned from the start.

Recommended initial form:

- `/api/v1/...`

The version should change when:

- payload contracts change incompatibly,
- endpoint semantics change incompatibly,
- core object meaning changes in a way that affects client expectations.

## Implementation Order

The recommended order for implementing these APIs is:

1. session import APIs,
2. profile create, update, load, and validate APIs,
3. analysis API,
4. comparison API,
5. retrieval and listing refinements.

This order matches the first useful backend slice.

## Minimum First Slice

The first useful backend slice should implement:

- `POST /api/v1/sessions/import`
- `GET /api/v1/sessions/{session_id}`
- `POST /api/v1/profiles`
- `PUT /api/v1/profiles/{profile_id}`
- `POST /api/v1/profiles/{profile_id}/validate`
- `POST /api/v1/analysis`

That is enough to support:

- importing a DAQ session,
- attaching or creating a profile,
- validating the profile,
- generating one trusted analysis result.

## Conclusion

Drafting the backend API reference first is the correct next step. The backend implementation should not begin as a set of isolated endpoints or ad hoc service calls. It should begin with a stable API surface that defines what the Python backend must provide to the frontend and to future backend maintainers. This document is intended to serve as that reference in Markdown format.