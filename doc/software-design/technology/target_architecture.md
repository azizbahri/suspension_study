# Target Architecture

## Abstract

This document describes the target architecture for the suspension DAQ software after the decision to use a rich web-style frontend with a Python analysis backend. The architecture is designed for a desktop-first MVP while preserving a clean migration path toward cloud-connected workflows and later AI-enabled capabilities.

The main design principle is separation of concerns:

- the frontend owns interaction, presentation, and workflow,
- the backend owns calibration, data processing, validation, and interpretation logic,
- persistent models carry validity and provenance explicitly,
- deployment should allow both local-first and cloud-connected modes over time.

---

## 1. Architectural Goals

The target architecture should:

- support a rich desktop UI now,
- preserve a path to browser and cloud delivery later,
- isolate numerical engineering logic from UI concerns,
- support provenance-aware calibration profiles,
- support future AI-assisted interpretation,
- remain practical for an MVP.

---

## 2. High-Level Architecture

The target system has four main layers:

1. frontend application,
2. local or remote application API layer,
3. analysis and calibration engine,
4. persistence layer.

Conceptually:

```text
React/Tauri Frontend
  -> application API
  -> Python services
  -> storage and project data
```

---

## 3. Frontend Layer

The frontend should be implemented with React and TypeScript.

Responsibilities:

- navigation,
- session import workflow,
- calibration workflow orchestration,
- analysis and comparison workspaces,
- warning and validity presentation,
- user notes and interaction state,
- graph layout and graph interaction orchestration.

The frontend should not perform calibration math or analytics itself. It should display and manipulate structured results returned by backend services.

### 3.1 Frontend Modules

Suggested modules:

- app shell,
- import workspace,
- calibration workspace,
- analysis workspace,
- comparison workspace,
- status and details panel,
- shared UI components,
- frontend state layer.

---

## 4. Application API Layer

The application API layer is the interface between the frontend and the Python services.

In the desktop-first MVP, this may be:

- a local API exposed by the Python process,
- or a Tauri-to-Python bridge with equivalent request and response boundaries.

Later, the same interface style should remain usable for cloud-hosted services.

Responsibilities:

- request validation,
- response shaping,
- stable contracts for sessions, calibration, and analysis,
- isolation of frontend from backend implementation details.

### 4.1 Core API Domains

Suggested API domains:

- session import,
- calibration profile management,
- calibration execution and validation,
- derived analysis generation,
- comparison generation,
- interpretation summary generation.

---

## 5. Python Analysis and Calibration Layer

The Python backend should own the engineering core of the product.

Responsibilities:

- DAQ parsing,
- channel mapping,
- calibration profile loading and saving,
- front and rear travel derivation,
- velocity processing,
- pitch processing,
- validity-state evaluation,
- provenance handling,
- preparation of graph-ready outputs,
- future AI-assisted interpretation logic.

### 5.1 Backend Modules

Suggested modules:

- import service,
- calibration service,
- analysis service,
- comparison service,
- interpretation service,
- profile repository,
- validation engine.

### 5.2 Domain Logic Boundary

The backend should treat the following as domain logic rather than API logic:

- front travel conversion,
- rear linkage conversion,
- differentiation and filtering,
- gyro integration,
- histogram generation,
- validity propagation,
- interpretation heuristics.

This keeps the most important engineering logic testable and reusable.

---

## 6. Persistence Layer

The persistence layer should support both local-first MVP operation and a later cloud-compatible architecture.

### 6.1 MVP Persistence

For the MVP, use:

- local session files,
- local calibration profiles,
- local app metadata,
- SQLite or file-backed project storage.

### 6.2 Later Cloud Persistence

For later phases, migrate or extend toward:

- centralized project storage,
- shared profile repositories,
- user-specific and team-specific calibration assets,
- cloud-backed session and analysis history.

### 6.3 Persisted Objects

The main persisted objects should include:

- raw session metadata,
- imported channel descriptors,
- calibration profiles,
- profile provenance and validation summaries,
- analysis result summaries,
- comparison result summaries,
- user notes.

---

## 7. Core Data Objects

The architecture should revolve around a small set of explicit data objects.

### 7.1 Session

Contains:

- imported raw channel metadata,
- timing information,
- file reference,
- detected channel availability,
- associated calibration profile.

### 7.2 Calibration Profile

Contains:

- profile identity,
- channel mapping,
- formula constants,
- validity states,
- provenance,
- revision metadata.

### 7.3 Analysis Result

Contains:

- derived travel,
- derived velocity,
- derived pitch,
- histogram data,
- plot-ready telemetry series,
- summary statistics,
- warnings and interpretation flags.

### 7.4 Comparison Result

Contains:

- session pair identity,
- aligned plot-ready outputs,
- delta statistics,
- interpretation summary,
- confidence notes.

---

## 8. Graphing Strategy

The graphing layer should be part of the frontend, but it should consume data already prepared by backend services.

The backend should provide:

- histogram bins,
- telemetry trace arrays,
- units,
- threshold markers,
- validity indicators,
- interpretation markers if needed.

The frontend graph components should focus on:

- rendering,
- zooming,
- cursor sync,
- overlay behavior,
- selection and inspection.

This avoids duplicating domain math in the UI.

---

## 9. Validity and Trust Flow

One of the most important architectural requirements is explicit trust propagation.

The flow should be:

```text
channel mapping validity
  -> calibration section validity
  -> derived channel validity
  -> graph validity
  -> interpretation confidence
```

The frontend should receive these states from the backend and display them clearly.

This matters because the software is intended to support engineering decisions, not just produce visually clean plots.

---

## 10. Desktop-First MVP Deployment

In the MVP, the architecture should run locally.

Suggested deployment model:

- Tauri desktop shell,
- local React frontend bundle,
- local Python service process,
- local project and profile storage.

This gives a strong desktop experience without forcing cloud infrastructure too early.

---

## 11. Cloud Migration Path

The architecture should be intentionally prepared for cloud migration.

That means:

- frontend service contracts should be network-safe,
- backend service boundaries should not depend on in-process UI assumptions,
- persistence abstractions should allow movement from local storage to server storage,
- authentication and multi-user concerns can be added later without rewriting the core analysis engine.

Possible future model:

- React frontend in browser,
- Python services deployed remotely,
- shared calibration and analysis data in managed storage,
- optional local ingestion helper for very large DAQ files.

---

## 12. Future AI Integration Path

The architecture should also preserve room for AI features.

Likely future AI domains:

- graph summarization,
- anomaly detection,
- calibration review assistance,
- tuning suggestion generation,
- natural-language query over session results.

The safest architecture is to place these in backend services that consume structured analysis results rather than raw UI state.

This allows AI features to remain explainable and grounded in the engineering outputs.

---

## 13. Recommended Module View

Conceptual module view:

```text
frontend/
  shell
  import
  calibration
  analysis
  compare
  shared-components

api/
  session
  calibration
  analysis
  comparison
  interpretation

backend/
  import-service
  calibration-service
  analysis-service
  comparison-service
  interpretation-service
  repositories
  validation

storage/
  sessions
  profiles
  metadata
```

---

## 14. Conclusion

The target architecture for this application should treat the UI and the engineering core as separate but tightly coordinated systems. React and TypeScript should own the user-facing workflow and product surface. Python should own the calibration, DAQ, analysis, validation, and future AI logic. Tauri should provide the desktop shell for the first product phase.

This architecture is the best fit for the product direction because it supports a rich desktop MVP now while preserving a clear path toward cloud deployment and AI-assisted features later.