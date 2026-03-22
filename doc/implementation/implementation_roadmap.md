# Suspension DAQ Implementation Roadmap

## Abstract

This document translates the theory, product design, calibration design, and implementation contracts into a build sequence. The purpose is to prevent the project from attempting a broad UI-first MVP before the backend service boundaries and domain objects are stable.

The recommended strategy is:

1. stabilize the backend contract,
2. implement one narrow vertical slice,
3. expand analysis families and comparison features incrementally.

---

## 1. Why the Project Should Not Start With a Full UI Build

The current documentation is strong enough to define the product boundary, but not yet complete enough to justify broad frontend implementation without contract work.

The main risk is churn in these areas:

- session object shape,
- calibration profile payload shape,
- validity propagation,
- graph payload structure,
- interpretation summary structure.

If those move after the UI is built, the team will spend time rewriting state flow and graph integration rather than validating the engineering loop.

---

## 2. Delivery Principle

The correct delivery principle is backend-first contract stabilization with frontend-visible validation at every step.

That means:

- the backend owns engineering truth,
- the frontend proves workflow value through thin slices,
- each slice must end in a usable screen, not only library code.

---

## 3. Recommended Phases

### Phase 0: Contract and Model Freeze

Deliverables:

- API contract defined in [api_contract.md](api_contract.md),
- canonical backend objects defined in [backend_data_structures.md](backend_data_structures.md),
- initial persistence choices for sessions and profiles,
- module boundaries for import, calibration, analysis, and comparison.

Exit criteria:

- the frontend team can build against stable workflow calls,
- the backend team can implement services without UI coupling.

### Phase 1: Import and Calibration Vertical Slice

Goal:

- prove the raw-data-to-valid-profile path.

Backend scope:

- session import service,
- channel detection,
- session persistence,
- calibration profile create and update,
- profile validation summary.

Frontend scope:

- import screen,
- session summary panel,
- calibration profile selector,
- validity status panel.

User-visible outcome:

- a user can import one DAQ file and create or attach one calibration profile with explicit trust state.

### Phase 2: Core Analysis Vertical Slice

Goal:

- prove the first trustworthy engineering graph path.

Backend scope:

- front travel derivation,
- rear travel derivation,
- one histogram generator,
- one telemetry trace payload,
- analysis validation summary.

Frontend scope:

- analysis workspace shell,
- one travel histogram panel,
- one telemetry panel,
- graph-level warning display.

User-visible outcome:

- a user can move from imported session to one trusted analysis view.

### Phase 3: Velocity and Pitch Expansion

Goal:

- extend the analysis from basic travel occupancy to dynamic behavior.

Backend scope:

- velocity processing service,
- pitch processing service,
- velocity histogram outputs,
- pitch trace outputs,
- interpretation summary rules for provisional guidance.

Frontend scope:

- velocity histogram panel,
- pitch trace panel,
- interpretation summary panel,
- confidence and provisional-state rendering.

User-visible outcome:

- a user can inspect ride height, dynamic motion, and chassis attitude in one coherent analysis screen.

### Phase 4: Comparison Slice

Goal:

- support actual tuning iteration rather than single-run inspection.

Backend scope:

- comparison request handling,
- alignment rules,
- delta statistics,
- comparison interpretation summary.

Frontend scope:

- baseline and comparison selection,
- overlay or side-by-side mode,
- delta summary display,
- notes field for physical setup change.

User-visible outcome:

- a user can compare two runs and determine whether a setup change moved the system in the intended direction.

### Phase 5: Hardening and Cloud Readiness

Goal:

- prepare the MVP architecture for broader product evolution.

Backend scope:

- caching and reproducibility improvements,
- structured logging and diagnostics,
- authentication-ready service boundaries,
- storage abstraction for future remote hosting.

Frontend scope:

- workflow polish,
- better error handling,
- session management refinements,
- performance optimization for larger files.

User-visible outcome:

- the MVP becomes a credible product foundation rather than only a prototype.

---

## 4. First Vertical Slice Recommendation

The first slice should not attempt every graph family.

The best first slice is:

1. import one session,
2. detect and review channels,
3. attach or create one calibration profile,
4. validate that profile,
5. generate one travel histogram and one telemetry trace,
6. show trust state in the UI.

This slice is small enough to build quickly but complete enough to test whether the architecture works.

---

## 5. Backend Module Breakdown

The implementation should likely begin with these backend modules:

- `import_service`
- `profile_repository`
- `calibration_service`
- `validation_service`
- `analysis_service`
- `histogram_service`
- `comparison_service`
- `interpretation_service`

Suggested ownership:

- `import_service` owns file parsing and channel discovery,
- `calibration_service` owns formula-specific calibration application,
- `validation_service` owns completeness and plausibility checks,
- `analysis_service` owns derived-channel orchestration,
- `histogram_service` owns occupancy and bin outputs,
- `comparison_service` owns run alignment and deltas,
- `interpretation_service` owns rule-based guidance and later AI-ready interfaces.

---

## 6. Frontend Module Breakdown

The frontend should begin with workflow modules instead of generic dashboard fragments.

Suggested modules:

- import workspace,
- calibration workspace,
- analysis workspace,
- comparison workspace,
- status panel,
- shared graph components,
- application state layer.

The frontend should not encode engineering equations. It should orchestrate requests, render returned payloads, and expose trust information clearly.

---

## 7. Integration Rules Between Backend and Frontend

The build should follow these rules:

- no frontend recomputation of calibration formulas,
- no graph component computes histogram occupancy from raw arrays unless explicitly delegated,
- all warnings shown in the UI should originate from backend validation or interpretation outputs,
- profile validity must gate analysis trust state,
- comparison logic must consume analysis results, not bypass them.

These rules keep engineering correctness centralized.

---

## 8. Decision Gate Before Expanding the MVP

Before the team expands beyond the first slice, confirm the following:

- the session object is stable,
- the calibration profile object is stable,
- graph payloads are render-ready,
- validity propagation is visible in the UI,
- one imported session can move from raw file to trusted graph without manual external processing.

If any of those are unstable, the project should continue backend contract work before broadening the interface.

---

## 9. Conclusion

The project should proceed toward the MVP, but not through a broad UI-first build. The correct path is to create a separate implementation layer of documentation, stabilize backend contracts and canonical data structures, then implement the MVP through narrow, end-to-end slices that prove both the engineering logic and the user workflow.