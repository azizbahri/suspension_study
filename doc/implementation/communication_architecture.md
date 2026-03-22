# Suspension DAQ Communication Architecture

## Abstract

This document defines how the frontend and backend should communicate in the suspension DAQ product. The purpose is to make the backend-first implementation strategy concrete and to clarify how a React desktop frontend should work with a Python engineering backend.

The intended communication model is API-style request and response boundaries, even in the desktop-first MVP where both sides run on the same machine.

That choice preserves three things:

- clean ownership of engineering logic,
- a stable interface between frontend and backend,
- a credible migration path toward cloud deployment later.

---

## 1. Core Decision

The frontend and backend should communicate through an API-style service boundary.

That means the frontend behaves as a client and the backend behaves as a service, regardless of whether both run locally or across a network.

For this product:

- frontend: React in a Tauri desktop shell,
- backend: Python services,
- communication: request-response calls defined by the application API contract.

This matches the boundary described in [api_contract.md](api_contract.md).

---

## 2. Why Use an API Boundary in a Local Desktop App

At first glance, a desktop MVP might seem simpler if the frontend directly calls Python logic through a tightly coupled bridge. That would reduce some initial wiring, but it would weaken the architecture.

The API-style boundary is preferred for four reasons.

### 2.1 It Keeps Engineering Logic Centralized

All calibration, derivation, validation, histogram generation, comparison logic, and interpretation logic remain in the Python backend.

The frontend does not need to know how the engineering outputs are computed. It only needs to know how to request them and render them.

### 2.2 It Stabilizes the Frontend Contract

The frontend can be developed against stable request and response shapes rather than against internal Python module details.

This lowers UI churn as the backend evolves internally.

### 2.3 It Improves Testability

The backend can be tested as a service layer with deterministic inputs and outputs.

The frontend can be tested separately by mocking API responses.

### 2.4 It Preserves Cloud Migration Optionality

If the product later moves toward a browser-based or cloud-connected model, the communication boundary already exists. The same logical API can be exposed remotely with far less refactoring.

---

## 3. Recommended MVP Communication Model

The recommended MVP model is:

1. Tauri hosts the desktop application shell.
2. React and TypeScript implement the user interface.
3. Python runs as a local backend service process.
4. The frontend communicates with that local backend through API-style calls.

Conceptually:

```text
React UI
  -> frontend service layer
  -> local API boundary
  -> Python backend services
  -> local storage and files
```

This is the cleanest implementation model for a backend-first product.

---

## 4. Transport Options

The logical contract should stay the same, but there are two realistic transport choices in the desktop MVP.

### 4.1 Option A: Local HTTP API

Frontend behavior:

- sends HTTP requests to a local Python service,
- receives JSON responses,
- treats the backend exactly like an API server.

Backend behavior:

- runs a local service, likely with FastAPI,
- exposes endpoints for import, profiles, validation, analysis, and comparison.

Advantages:

- strongest separation,
- easiest to test independently,
- easiest to evolve into remote deployment,
- easiest to inspect and debug.

Disadvantages:

- slightly more process-management and startup work,
- requires local service lifecycle handling.

### 4.2 Option B: Tauri-to-Python Bridge

Frontend behavior:

- calls a Tauri-side bridge or command layer,
- bridge forwards structured requests to Python logic,
- frontend still uses request-response service semantics.

Backend behavior:

- may run embedded or locally spawned behind the bridge,
- still returns structured response objects.

Advantages:

- can reduce visible networking setup,
- may simplify local packaging in some cases.

Disadvantages:

- easier to blur service boundaries,
- less natural for future cloud migration,
- can encourage accidental coupling between frontend and backend internals.

---

## 5. Recommended Choice

For this project, Option A is the better default.

Recommended implementation direction:

- Python backend implemented as a local FastAPI service,
- React frontend calling that service through a dedicated frontend API layer,
- Tauri responsible for application shell behavior and local packaging rather than for owning engineering logic.

This gives the cleanest separation between product UI and engineering computation.

---

## 6. What the Frontend Sends

The frontend should send only workflow and user-input information.

Examples:

- file import requests,
- selected session identifiers,
- selected profile identifiers,
- calibration form values,
- display options,
- comparison selections,
- segment selections.

The frontend should not send computed engineering outputs back into the system as if they were authoritative.

---

## 7. What the Backend Returns

The backend should return render-ready, trust-aware outputs.

Examples:

- import diagnostics,
- channel descriptors,
- calibration profiles,
- validation summaries,
- derived telemetry series,
- histogram payloads,
- comparison outputs,
- interpretation summaries,
- warnings and confidence state.

This matches the canonical object model in [backend_data_structures.md](backend_data_structures.md).

---

## 8. Example Communication Flow

### 8.1 Import Flow

1. frontend submits an import request,
2. backend parses the DAQ file,
3. backend detects channels and timing,
4. backend returns `SessionImportResult`,
5. frontend renders import diagnostics and next actions.

### 8.2 Calibration Flow

1. frontend submits profile values,
2. backend persists the profile,
3. backend validates section completeness and plausibility,
4. backend returns `CalibrationProfile` and `ValidationSummary`,
5. frontend renders badges, warnings, and guided actions.

### 8.3 Analysis Flow

1. frontend requests analysis for a session and profile,
2. backend computes travel, velocity, pitch, histograms, and summaries,
3. backend returns `AnalysisResult`,
4. frontend renders the graphs, tables, and trust state.

### 8.4 Comparison Flow

1. frontend requests comparison between two analyses or sessions,
2. backend aligns outputs and computes deltas,
3. backend returns `ComparisonResult`,
4. frontend renders overlays and delta summaries.

---

## 9. Backend Language and Responsibility

The intended backend language is Python.

Python should own:

- import and parsing,
- calibration math,
- filtering and differentiation,
- pitch integration and drift-control logic,
- histogram generation,
- validation,
- comparison logic,
- interpretation logic,
- persistence orchestration for analysis objects.

This is the correct fit because the product's hardest problems are analytical and calibration-heavy rather than UI-bound.

---

## 10. Frontend Service Layer

The frontend should not call endpoints directly from UI components. It should use a thin frontend service layer.

Suggested responsibility split:

- UI components own presentation and interaction,
- frontend service layer owns API calls and response parsing,
- backend owns engineering truth.

That makes the UI easier to test and keeps transport details out of chart and workflow components.

---

## 11. Failure Handling

The communication layer should preserve the distinction between:

- hard backend failures,
- usable results with warnings,
- valid results with confidence notes.

The frontend should display those states clearly, but the backend should decide which state applies.

---

## 12. Future Cloud Migration

If the product later moves toward cloud-connected workflows, the intended progression is straightforward:

- replace local API endpoint targets with remote ones,
- preserve the same logical request and response structures,
- move persistence and heavier processing to remote services where appropriate,
- keep the frontend largely unchanged at the contract level.

This is one of the main reasons to keep the local MVP API-shaped from the start.

---

## 13. Conclusion

The frontend and backend should communicate through API-style calls, even in the local desktop MVP. The backend should be implemented in Python and should own all engineering logic. The frontend should act as a client that sends user intent and renders backend results. For the MVP, the strongest implementation choice is a local FastAPI-style Python service behind a React and Tauri desktop application.