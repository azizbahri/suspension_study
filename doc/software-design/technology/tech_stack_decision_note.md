# Technology Stack Decision Note

## Decision

The software should be implemented using:

- React
- TypeScript
- Tauri for desktop packaging
- Python backend services for DAQ import, calibration, analytics, and future AI features

For the first product phase, this should be treated as a desktop-first application with a web-style frontend and a local Python analysis backend. The architecture should be designed so the same frontend concepts and most of the backend service boundaries can later support a cloud-connected or fully cloud-hosted version.

---

## Context

The software is no longer being treated as only a local engineering tool. The current direction includes:

- a rich and polished UI,
- a strong desktop user experience in the MVP,
- future cloud migration,
- future AI-assisted workflows.

At the same time, the application still depends heavily on engineering workflows defined elsewhere in the documentation:

- raw DAQ import,
- calibration profile creation and validation,
- front and rear travel derivation,
- velocity and pitch processing,
- provenance-aware profile handling,
- validity-aware interpretation.

This means the chosen stack must support both product-grade interface evolution and engineering-grade numerical work.

---

## Requirements That Drive the Decision

The stack must support:

- a richer UI than a traditional engineering desktop shell,
- portability across desktop platforms,
- a credible path to browser or cloud deployment later,
- calibration and analytics logic that remains testable and numerically trustworthy,
- future service-oriented AI features.

The stack must also align with the existing software notes on product definition, calibration design, data model, and MVP UI.

---

## Options Considered

### Option 1: Python + PySide6 + QML

Strengths:

- excellent for engineering workflows,
- strong for numerical iteration,
- portable desktop UI,
- lower complexity for a pure local MVP.

Weaknesses:

- weaker long-term path for cloud migration,
- likely larger UI rewrite cost if the product later moves to the web,
- less aligned with a future product that treats UI richness as a top-level requirement.

### Option 2: React + TypeScript + Tauri + Python backend

Strengths:

- strong UI richness and product flexibility,
- clean path from desktop packaging to web delivery,
- strong ecosystem for design systems and richer interaction,
- natural service boundary for future AI features,
- Python remains available where it is strongest: calibration and analytics.

Weaknesses:

- more architectural complexity than a single-language local tool,
- requires clean boundaries between frontend and backend,
- slightly higher MVP setup cost.

### Option 3: C++ + Qt

Strengths:

- high performance,
- mature desktop tooling,
- strong native application model.

Weaknesses:

- slower iteration for calibration-heavy workflows,
- weaker fit for rapid product evolution,
- not the best path toward cloud and AI-oriented product growth.

---

## Decision Rationale

Option 2 is preferred because the product priorities have changed.

If the goal were only to build a local engineering desktop application, Python with Qt would still be the strongest overall choice. But the stated direction now includes:

- richer product UI,
- likely cloud migration,
- future AI leverage.

Those priorities move the frontend from being a supporting shell to being a core strategic part of the application. React and TypeScript are better suited for that future.

At the same time, the product's hardest engineering problems still belong in Python:

- signal processing,
- calibration fitting,
- derived-channel generation,
- validity propagation,
- provenance-aware data handling,
- future AI-assisted interpretation.

That makes a split architecture the correct long-term decision.

---

## Chosen Stack

### Frontend

- React
- TypeScript
- a modern component system
- charting and interaction components appropriate for engineering telemetry views

### Desktop Packaging

- Tauri

### Backend and Analysis Engine

- Python
- FastAPI or an equivalent service interface
- NumPy
- SciPy
- pandas
- Pydantic

### Persistence

- SQLite or file-backed local storage for the MVP
- PostgreSQL or equivalent when cloud-hosted multi-user workflows become relevant

---

## Architectural Implications

This decision implies the following:

- the frontend should not own calibration math,
- the backend should expose calibration, session, and analysis services through stable interfaces,
- the UI should consume derived data and validity states rather than recompute them,
- the same backend boundaries should remain usable whether the app is packaged locally or deployed through networked services.

---

## Consequences

### Positive Consequences

- better UI richness and long-term product flexibility,
- better migration path to cloud delivery,
- cleaner path for AI-enabled services,
- continued use of Python where engineering value is highest.

### Negative Consequences

- increased architecture and integration complexity,
- more effort required to define data contracts between frontend and backend,
- a slightly slower MVP than a pure Python desktop application.

These costs are acceptable because they align with the expected direction of the product.

---

## Decision Summary

The product should use a rich frontend stack and a Python engineering backend.

Recommended implementation direction:

- React + TypeScript + Tauri
- Python backend services for calibration, analytics, and future AI functionality

This is the correct choice for a desktop-first product that is expected to evolve into a richer, cloud-capable, AI-assisted application.