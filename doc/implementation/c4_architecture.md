# Suspension DAQ C4 Architecture

## Abstract

This document captures the suspension DAQ software architecture using a pragmatic subset of the C4 model. The purpose is not to produce a large enterprise architecture package. The purpose is to make the current backend-first implementation direction explicit, shared, and stable enough to guide the next phase of development.

At this stage, the most useful C4 levels are:

- Level 1: System Context
- Level 2: Container
- Level 3: Backend Components

Those three levels are enough to clarify system boundaries, communication paths, and backend ownership without dropping prematurely into code-level diagrams.

---

## 1. Scope and Intent

This C4 note is aligned with the implementation direction already defined in:

- [api_contract.md](api_contract.md)
- [communication_architecture.md](communication_architecture.md)
- [backend_data_structures.md](backend_data_structures.md)
- [implementation_roadmap.md](implementation_roadmap.md)

The working assumptions are:

- the product is desktop-first,
- the frontend is React inside a Tauri shell,
- the backend is Python,
- the frontend and backend communicate through an API-style boundary,
- the backend owns engineering truth.

---

## 2. Why C4 Is Useful Here

The repository already has strong narrative documentation, but the implementation risk has shifted away from theory and toward system structure.

The main questions now are:

- what sits inside the product boundary,
- how the frontend and backend communicate,
- what the backend must contain,
- how persistence and analysis outputs fit together.

The C4 model is useful here because it answers those questions in a form that is easier to reason about during implementation than long narrative notes alone.

---

## 3. Level 1: System Context

At the highest level, the software sits between human users, raw DAQ data, and future optional remote services.

### 3.1 Primary Actors

- suspension engineer
- test technician
- advanced rider or tuner

### 3.2 External Systems and Resources

- local DAQ files and exported logger data
- local project storage
- optional future cloud services

### 3.3 Context View

```text
Users
  -> Suspension DAQ Application
  -> Local DAQ files

Suspension DAQ Application
  -> Local project storage
  -> Optional future cloud services
```

### 3.4 Context Interpretation

The important context decision is that the DAQ application is the primary engineering system of record for calibration, derived analysis, and interpretation. Raw DAQ files remain an input source, not the user-facing analysis environment.

---

## 4. Level 2: Container View

The most important C4 level for the current phase is the container level.

### 4.1 Containers

The system should be understood as these main containers:

- React frontend
- Tauri desktop shell
- Python backend service
- local storage and project data
- imported DAQ files

### 4.2 Container Responsibilities

#### React Frontend

Owns:

- screens and workflow,
- forms and user input,
- graph rendering,
- stateful interaction,
- warnings and trust visibility.

Does not own:

- calibration math,
- histogram computation,
- derived-channel generation,
- interpretation logic.

#### Tauri Desktop Shell

Owns:

- application packaging,
- desktop window lifecycle,
- local shell integration,
- process coordination where required.

Does not own:

- engineering logic,
- canonical analysis models.

#### Python Backend Service

Owns:

- import and parsing,
- calibration application,
- validation,
- derived-channel generation,
- histogram generation,
- comparison logic,
- interpretation logic,
- persistence orchestration.

#### Local Storage

Owns:

- session metadata,
- calibration profiles,
- selected analysis outputs,
- notes and project metadata.

#### DAQ Files

Provide:

- raw imported data,
- logger exports,
- source timing and channel input.

### 4.3 Container Diagram

```text
Users
  -> React Frontend

React Frontend
  -> Python Backend Service

Tauri Desktop Shell
  -> React Frontend
  -> Python Backend Service

Python Backend Service
  -> Local Storage
  -> Imported DAQ Files

Future option:
Python Backend Service
  -> Remote services
```

### 4.4 Container Interpretation

This is the key system decision:

- the frontend is a client,
- the backend is a service,
- the desktop shell is packaging and orchestration infrastructure,
- engineering logic remains centralized in Python.

This is consistent with the recommendation in [communication_architecture.md](communication_architecture.md) that the MVP should use a local API-style boundary even though both main containers run on the same machine.

---

## 5. Level 3: Backend Component View

The backend component view is the highest-value detailed diagram for the current implementation phase.

### 5.1 Backend Components

The Python backend should be decomposed into these components:

- API layer
- import service
- profile repository
- calibration service
- validation service
- analysis service
- histogram service
- comparison service
- interpretation service

### 5.2 Component Responsibilities

#### API Layer

Owns:

- request parsing,
- response shaping,
- endpoint orchestration,
- error translation.

#### Import Service

Owns:

- DAQ file parsing,
- channel discovery,
- sample-rate and timing extraction,
- session import diagnostics.

#### Profile Repository

Owns:

- loading and saving calibration profiles,
- revision tracking,
- persistence access for profile objects.

#### Calibration Service

Owns:

- application of formula-specific calibration,
- front travel conversion,
- rear travel conversion,
- pitch and velocity configuration application.

#### Validation Service

Owns:

- completeness checks,
- plausibility checks,
- validity propagation,
- warning generation.

#### Analysis Service

Owns:

- orchestration of derived-channel generation,
- creation of analysis results,
- coordination of downstream histogram and summary computations.

#### Histogram Service

Owns:

- occupancy binning,
- histogram percentages,
- threshold marker generation,
- histogram-specific validity flags.

#### Comparison Service

Owns:

- session alignment,
- delta metrics,
- comparison output assembly.

#### Interpretation Service

Owns:

- rule-based observations,
- likely-cause generation,
- confidence notes,
- future AI-ready interpretation boundary.

### 5.3 Backend Component Diagram

```text
API Layer
  -> Import Service
  -> Profile Repository
  -> Calibration Service
  -> Validation Service
  -> Analysis Service
  -> Comparison Service

Analysis Service
  -> Calibration Service
  -> Validation Service
  -> Histogram Service
  -> Interpretation Service
  -> Profile Repository

Comparison Service
  -> Analysis Service
  -> Interpretation Service

Import Service
  -> Local files

Profile Repository
  -> Local storage
```

### 5.4 Component Interpretation

The important design choice is that the backend is not a single monolithic script behind a few endpoints. It is a set of engineering components with different responsibilities and test surfaces.

That matters because the product's correctness depends on keeping these concerns separate:

- parsing,
- calibration,
- validation,
- numerical analysis,
- statistical reduction,
- interpretation.

---

## 6. Deliberate Omissions

This document intentionally does not define:

- frontend Level 3 component diagrams,
- Level 4 code diagrams,
- detailed cloud deployment infrastructure,
- authentication architecture.

Those would be premature right now. The immediate implementation pressure is on the backend contract and backend module structure.

---

## 7. Implementation Guidance Derived From the C4 View

The C4 view leads to a few direct implementation rules.

### 7.1 Frontend Rules

- render returned analysis payloads,
- do not recompute engineering results,
- keep API access in a frontend service layer rather than in UI components.

### 7.2 Backend Rules

- keep calibration and analysis in Python,
- keep validity propagation in the backend,
- return graph-ready outputs rather than raw intermediate values where possible,
- separate repository concerns from numerical analysis concerns.

### 7.3 Persistence Rules

- persist sessions and calibration profiles as canonical objects,
- persist selected analysis summaries where reproducibility is valuable,
- do not make transport payloads the system of record.

---

## 8. Recommended Use of This Document

This document should be used as:

- a shared architectural reference before backend implementation starts,
- a review check for whether new modules belong in the backend or the frontend,
- a boundary document when defining the Python package layout,
- a guardrail against UI-driven duplication of engineering logic.

---

## 9. Conclusion

A C4 design spec is useful for this software if kept focused. The right scope is the one captured here: system context, containers, and backend components. That is enough to guide the backend-first implementation phase without creating documentation overhead that does not yet serve the project.