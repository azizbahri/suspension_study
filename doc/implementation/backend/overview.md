# Suspension DAQ Backend Overview

## Abstract

This document defines the backend components that should be implemented for the suspension DAQ software. The backend is the engineering core of the product. It owns DAQ import, calibration application, derived-channel generation, validation, histogram generation, comparison logic, and interpretation support.

The goal of this overview is to turn the higher-level architecture notes into a concrete backend implementation map.

---

## 1. Backend Role

The backend exists to convert raw DAQ inputs into trusted engineering outputs.

Its core role is:

```text
raw DAQ files
  -> imported sessions
  -> calibrated physical signals
  -> derived analysis channels
  -> histogram and telemetry outputs
  -> comparison results
  -> interpretation support
```

The backend should therefore be treated as the system that owns analytical truth. The frontend should request outputs from it, not reimplement those calculations.

---

## 2. Design Principles

The backend should be implemented with the following principles.

- keep engineering logic centralized in Python,
- separate persistence concerns from numerical analysis concerns,
- make validity propagation explicit,
- make all core outputs reproducible,
- expose stable service boundaries through the API layer,
- keep components small enough to test independently.

---

## 3. Core Backend Components

The backend should be decomposed into the following components.

### 3.1 API Layer

Purpose:

- expose the backend through stable request and response contracts,
- validate incoming payload shape,
- orchestrate calls into backend services,
- return structured errors and warnings.

Responsibilities:

- endpoint definitions,
- request parsing,
- response shaping,
- transport-level error handling,
- top-level workflow routing.

Typical outputs:

- `SessionImportResult`,
- `CalibrationProfile`,
- `ValidationSummary`,
- `AnalysisResult`,
- `ComparisonResult`.

### 3.2 Import Service

Purpose:

- ingest raw DAQ data and convert it into a usable session record.

Responsibilities:

- file parsing,
- format detection,
- timestamp and sample-rate extraction,
- channel discovery,
- import diagnostics,
- raw session metadata construction.

Key inputs:

- CSV, binary export, or other logger output.

Key outputs:

- `SessionRecord`,
- `ChannelDescriptor[]`,
- import warnings and diagnostics.

### 3.3 Session Repository

Purpose:

- persist and retrieve imported session metadata and related references.

Responsibilities:

- session save and load,
- source file reference management,
- session indexing,
- session metadata lookup,
- optional cached analysis references.

This repository should manage persistent session state, not perform engineering calculations.

### 3.4 Profile Repository

Purpose:

- persist and retrieve calibration profiles.

Responsibilities:

- create profile records,
- update profile revisions,
- load active profiles,
- retain provenance and revision metadata,
- support profile history where needed.

### 3.5 Calibration Service

Purpose:

- apply the calibration profile to raw session data.

Responsibilities:

- front travel conversion,
- rear travel conversion,
- linkage-model application,
- pitch configuration application,
- velocity configuration application,
- histogram-configuration consumption.

This service is where raw channels first become calibrated physical signals.

### 3.6 Validation Service

Purpose:

- determine whether the current inputs and outputs are complete, plausible, and trustworthy.

Responsibilities:

- calibration completeness checks,
- channel mapping checks,
- plausibility checks on constants and outputs,
- validity-state propagation,
- warning generation,
- recommended-next-action generation.

The validation service should operate both on profiles and on analysis results.

### 3.7 Analysis Service

Purpose:

- orchestrate derived-channel generation and assemble analysis outputs.

Responsibilities:

- derived travel creation,
- derived velocity creation,
- derived pitch creation,
- summary-statistics assembly,
- coordination of histogram generation,
- coordination of interpretation support,
- assembly of `AnalysisResult`.

This service is the main orchestrator for single-session engineering analysis.

### 3.8 Histogram Service

Purpose:

- generate histogram outputs from validated derived series.

Responsibilities:

- travel histogram generation,
- velocity histogram generation,
- occupancy percentage calculation,
- threshold marker generation,
- histogram payload assembly,
- histogram validity attachment.

This service should return render-ready histogram payloads rather than raw intermediate structures.

### 3.9 Comparison Service

Purpose:

- compare two sessions or two analyses.

Responsibilities:

- session alignment,
- baseline-versus-comparison result coordination,
- delta metric generation,
- comparison payload assembly,
- comparison warning propagation,
- `ComparisonResult` assembly.

### 3.10 Interpretation Service

Purpose:

- provide structured engineering interpretation support.

Responsibilities:

- observation extraction,
- likely-cause generation,
- gating-warning handling,
- confidence-note generation,
- suggested review area generation,
- future AI-ready interpretation boundary.

This service should remain separate from raw numerical analysis so it can evolve independently.

### 3.11 Persistence Support Layer

Purpose:

- support backend persistence consistently across repositories.

Responsibilities:

- database/session management,
- file-backed storage coordination,
- transaction boundaries,
- storage configuration,
- migration support if schemas evolve.

This layer should be infrastructural rather than domain-owning.

### 3.12 Shared Domain Models Layer

Purpose:

- define the canonical backend object model.

Responsibilities:

- session models,
- calibration models,
- validation models,
- analysis models,
- comparison models,
- interpretation models.

These should align with [../backend_data_structures.md](../backend_data_structures.md).

---

## 4. Component Relationships

The backend should work approximately like this:

```text
API Layer
  -> Import Service
  -> Session Repository
  -> Profile Repository
  -> Validation Service
  -> Analysis Service
  -> Comparison Service

Analysis Service
  -> Calibration Service
  -> Validation Service
  -> Histogram Service
  -> Interpretation Service
  -> Session Repository
  -> Profile Repository

Comparison Service
  -> Analysis Service
  -> Interpretation Service

Repositories
  -> Persistence Support Layer
```

This separation keeps engineering logic, persistence, and API concerns from collapsing into one layer.

---

## 5. Minimum Backend Needed for the First Slice

The first working backend slice does not need every feature.

The minimum useful set is:

- API layer,
- import service,
- session repository,
- profile repository,
- calibration service,
- validation service,
- analysis service,
- histogram service,
- shared domain models.

The comparison and interpretation services can start as thinner components or later-phase additions if necessary.

That said, the interfaces for them should still be anticipated now.

---

## 6. Suggested Build Order

The recommended order for backend implementation is:

1. shared domain models,
2. persistence support layer,
3. session repository,
4. profile repository,
5. import service,
6. calibration service,
7. validation service,
8. analysis service,
9. histogram service,
10. API layer,
11. comparison service,
12. interpretation service.

This order reflects dependency direction and lets the project reach a usable first slice quickly.

---

## 7. Recommended Python Package View

A reasonable package direction would be:

```text
backend/
  api/
  models/
  services/
    import_service/
    calibration_service/
    validation_service/
    analysis_service/
    histogram_service/
    comparison_service/
    interpretation_service/
  repositories/
    session_repository/
    profile_repository/
  persistence/
  utils/
```

This is not the only valid layout, but it matches the responsibilities defined above and keeps domain logic visible.

---

## 8. Boundary Rules

The backend implementation should follow these boundary rules:

- repositories do not perform engineering analysis,
- services do not own transport formatting beyond their canonical result objects,
- the API layer does not implement engineering formulas,
- histogram generation stays in the backend,
- validity propagation stays in the backend,
- interpretation is layered on top of validated analysis outputs.

If those rules are broken, the backend will become harder to reason about and harder to test.

---

## 9. Conclusion

The backend should be implemented as a set of focused Python components rather than a single large service module. The essential components are the API layer, import service, repositories, calibration service, validation service, analysis service, histogram service, comparison service, interpretation service, and the supporting persistence and domain-model layers. That is the backend definition that should guide the implementation phase.