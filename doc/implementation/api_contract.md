# Suspension DAQ API Contract

## Abstract

This document defines the application-facing API contract for the suspension DAQ product. The goal is to stabilize the boundary between the user interface and the engineering backend before broad MVP implementation begins.

The API must support the full product loop:

$$
\text{import session} \rightarrow \text{attach or create calibration profile} \rightarrow \text{validate} \rightarrow \text{derive analysis outputs} \rightarrow \text{compare sessions}
$$

The API should expose engineering results, validity state, and provenance in a form the frontend can render directly without reimplementing domain math.

---

## 1. Contract Goals

The API contract should satisfy these goals:

- keep calibration and analysis logic in the backend,
- give the frontend stable workflow-oriented calls,
- expose explicit validity and provenance state,
- support local-first desktop deployment now,
- remain compatible with later remote deployment.

This is not only a transport design. It is the operational definition of how the product moves from raw DAQ files to trusted graphs.

---

## 2. API Style

The implementation may use HTTP over a local FastAPI service, a Tauri bridge, or another request-response interface. Regardless of transport, the logical API should remain the same.

The frontend should treat the backend as a service with the following domains:

- session import,
- calibration profile management,
- validation,
- analysis generation,
- comparison generation,
- interpretation summary generation.

---

## 3. Core API Domains

### 3.1 Session Domain

Responsibilities:

- ingest DAQ files,
- detect channels,
- persist session metadata,
- expose session summaries to the UI.

### 3.2 Calibration Domain

Responsibilities:

- create and update calibration profiles,
- store formula-specific constants,
- validate profile completeness and plausibility,
- expose section-level validity.

### 3.3 Analysis Domain

Responsibilities:

- generate derived travel, velocity, and pitch outputs,
- generate graph-ready histograms and traces,
- compute summary statistics,
- return warnings and interpretation confidence.

### 3.4 Comparison Domain

Responsibilities:

- align two sessions,
- produce overlay-ready outputs,
- compute delta metrics,
- summarize likely setup differences.

---

## 4. Canonical Workflow Calls

The MVP should support the following logical call flow.

### 4.1 Import Session

Input:

- source file path or imported file reference,
- optional bike or logger metadata,
- optional delimiter or file-format hints.

Output:

- `sessionId`,
- import status,
- detected channel descriptors,
- sample rate and duration,
- missing-channel warnings,
- import diagnostics.

Conceptual call:

```text
createSessionImport(request) -> SessionImportResult
```

### 4.2 Get Session Summary

Input:

- `sessionId`.

Output:

- session metadata,
- detected channels,
- assigned calibration profile if present,
- validation summary for import readiness.

Conceptual call:

```text
getSession(sessionId) -> SessionRecord
```

### 4.3 Create or Update Calibration Profile

Input:

- profile identity fields,
- channel mapping fields,
- front travel fields,
- rear travel fields,
- velocity processing fields,
- pitch processing fields,
- histogram settings.

Output:

- saved profile identity,
- revision metadata,
- section-level validity,
- persistence status.

Conceptual calls:

```text
createCalibrationProfile(request) -> CalibrationProfile
updateCalibrationProfile(profileId, request) -> CalibrationProfile
```

### 4.4 Validate Calibration Profile

Input:

- `profileId`,
- optional `sessionId` for data-backed plausibility checks.

Output:

- overall profile validity,
- per-section validity,
- warnings,
- failed checks,
- recommended next actions.

Conceptual call:

```text
validateCalibrationProfile(request) -> ValidationSummary
```

### 4.5 Run Analysis

Input:

- `sessionId`,
- `profileId`,
- analysis options,
- requested output families.

Output:

- derived channels,
- histogram payloads,
- telemetry payloads,
- summary statistics,
- warnings,
- interpretation summary,
- confidence state.

Conceptual call:

```text
runAnalysis(request) -> AnalysisResult
```

### 4.6 Compare Sessions

Input:

- baseline `sessionId`,
- comparison `sessionId`,
- associated `profileId` values,
- alignment and comparison options.

Output:

- aligned result references,
- overlay-ready histograms and traces,
- delta metrics,
- comparison interpretation summary,
- confidence notes.

Conceptual call:

```text
compareSessions(request) -> ComparisonResult
```

---

## 5. Request and Response Principles

The API should follow these principles.

### 5.1 Frontend Never Sends Derived Engineering Results

The frontend may send:

- raw user inputs,
- calibration constants,
- display options,
- session and profile selection.

The frontend should not send:

- computed histograms,
- computed derived channels,
- interpretation decisions.

Those belong to the backend.

### 5.2 Every Response Includes Trust State

Any response that affects engineering interpretation should include:

- `validity`,
- `warnings`,
- `provenanceSummary` where relevant,
- `confidence` when interpretation is returned.

### 5.3 Graph Payloads Must Be Render-Ready

The backend should send graph-ready payloads rather than forcing the frontend to reconstruct engineering structures.

Examples:

- histogram bins and percentages,
- telemetry series with units,
- threshold markers,
- validity overlays,
- interpretation markers when appropriate.

---

## 6. Required Response Objects

The following response objects should exist at minimum.

### 6.1 SessionImportResult

Required fields:

- `sessionId`
- `status`
- `sessionSummary`
- `channelDescriptors`
- `importWarnings`
- `importDiagnostics`

### 6.2 ValidationSummary

Required fields:

- `overallValidity`
- `sectionValidity`
- `warnings`
- `errors`
- `recommendedActions`

### 6.3 AnalysisResult

Required fields:

- `analysisId`
- `sessionId`
- `profileId`
- `derivedSeries`
- `histograms`
- `summaryStatistics`
- `warnings`
- `interpretationSummary`
- `confidence`

### 6.4 ComparisonResult

Required fields:

- `comparisonId`
- `baselineSessionId`
- `comparisonSessionId`
- `alignedOutputs`
- `deltaStatistics`
- `warnings`
- `interpretationSummary`
- `confidence`

---

## 7. Error and Warning Model

The API should distinguish between hard failures and usable-but-flagged outputs.

### 7.1 Hard Failures

Use hard failures when:

- the file cannot be parsed,
- required session data is absent,
- the profile identifier is missing,
- the requested analysis cannot run at all.

### 7.2 Warnings

Use warnings when:

- estimated constants are used,
- one graph family is provisional,
- fit quality is weak,
- the pitch reference is biased,
- the session contains suspect timing or channel behavior.

The UI should be able to display both without guessing severity.

---

## 8. Validity Propagation Through the API

Validity should propagate from the lowest physical layer upward.

The intended logic is:

```text
channel mapping validity
  -> calibration section validity
  -> derived channel validity
  -> graph payload validity
  -> interpretation confidence
```

The API must carry this chain explicitly. The frontend should not infer it indirectly from missing fields.

---

## 9. Suggested MVP Endpoint Set

If implemented as HTTP endpoints, the MVP should begin with a small set.

Suggested endpoints:

- `POST /sessions/import`
- `GET /sessions/{sessionId}`
- `POST /profiles`
- `PUT /profiles/{profileId}`
- `GET /profiles/{profileId}`
- `POST /profiles/{profileId}/validate`
- `POST /analysis`
- `POST /comparisons`

This is enough for the first useful vertical slice.

---

## 10. Tie to Frontend Workflow

The frontend workflow should map cleanly onto the API.

Import screen:

- calls `POST /sessions/import`,
- renders channel detection and import diagnostics.

Calibration screen:

- calls profile create, update, load, and validate operations,
- renders section validity and recommended actions.

Analysis workspace:

- calls `POST /analysis`,
- renders histograms, traces, and trust state.

Comparison workspace:

- calls `POST /comparisons`,
- renders overlay-ready outputs and delta summaries.

---

## 11. Conclusion

The MVP should not start by building a broad UI against unstable assumptions. It should start by fixing this application contract so the backend owns engineering truth and the frontend consumes stable, trust-aware results. That boundary is the key implementation step that ties the software-design notes to an actual product.