# MVP UI Document for Suspension DAQ Software

## Abstract

This document defines the minimum viable user interface for the suspension DAQ software. The purpose of the MVP is not to expose every possible engineering option. The purpose is to give a user a complete and usable path from raw DAQ import to calibrated graphs and setup interpretation with enough transparency that the outputs can be trusted.

The MVP UI must therefore support four core actions:

- import a session,
- create or select a calibration profile,
- inspect the main graphs and telemetry,
- compare sessions and interpret likely tuning changes.

This is the smallest product that can deliver real suspension value rather than just display raw data.

---

## 1. MVP Objective

The MVP should let an engineer or knowledgeable rider answer the following questions with one coherent interface:

- Did my DAQ file import correctly?
- Is the calibration profile complete and trustworthy?
- What are the front and rear suspension doing?
- What does the position histogram say about ride height and travel use?
- What does the velocity histogram say about compression and rebound behavior?
- What does the pitch trace say about chassis attitude and load transfer?
- What changed between two sessions or two setups?

If the UI cannot answer those questions clearly, it is not yet a viable product.

---

## 2. User Types for the MVP

The MVP primarily serves two user types.

### 2.1 Engineering User

This user wants:

- clear units,
- explicit calibration status,
- synchronized plots,
- traceable formulas,
- fast comparison between runs.

### 2.2 Advanced Rider or Enthusiast

This user wants:

- simple import,
- understandable graph labels,
- guided interpretation,
- clear warnings when calibration is incomplete,
- enough detail to make suspension changes with confidence.

The MVP should work for both users without becoming either too shallow or too overloaded.

---

## 3. MVP Information Architecture

The MVP should be organized into five main areas:

1. session import,
2. calibration setup,
3. analysis workspace,
4. comparison workspace,
5. profile and status panel.

This is enough structure for a real workflow without forcing the user through a large enterprise-style application shell.

---

## 4. Required Screens for the MVP

The MVP does not need dozens of views. It needs a small number of strong views.

### 4.1 Import Screen

Purpose:

- bring DAQ data into the product,
- identify channels,
- show whether the session is usable.

Required UI elements:

- file picker or drag-and-drop import area,
- imported file list,
- session metadata summary,
- detected channel table,
- sample rate display,
- session duration display,
- missing-channel warnings,
- proceed button to calibration or analysis.

Required user outcomes:

- confirm the file loaded,
- see which channels are available,
- know immediately if the file is incomplete.

### 4.2 Calibration Screen

Purpose:

- select, create, and validate the calibration profile used by the session.

Required UI elements:

- profile selector,
- new-profile button,
- profile validity badge,
- channel mapping summary,
- per-formula calibration status cards,
- links or tabs to front, rear, velocity, and pitch calibration tools,
- save profile button,
- validation summary panel.

Required user outcomes:

- know whether the current profile is usable,
- identify missing constants quickly,
- enter the calibration flow without hunting through menus.

### 4.3 Analysis Workspace

Purpose:

- display the core graphs and make the data interpretable.

Required UI elements:

- travel histogram panel,
- velocity histogram panel,
- pitch and time-series telemetry panel,
- synchronized cursor,
- front or rear channel selector where applicable,
- event zoom control,
- statistics summary cards,
- interpretation summary panel.

Required user outcomes:

- inspect where the suspension lives in the stroke,
- inspect how fast it moves,
- inspect how the chassis rotates,
- connect graphs to likely setup behavior.

### 4.4 Comparison Workspace

Purpose:

- compare sessions, setups, or tuning changes.

Required UI elements:

- session A and session B selectors,
- profile labels for both sessions,
- overlay toggle,
- side-by-side plot mode,
- delta statistics summary,
- notes field for change description.

Required user outcomes:

- compare before and after preload,
- compare spring changes,
- compare damping changes,
- verify whether a setup moved the graphs in the intended direction.

### 4.5 Status and Details Panel

Purpose:

- keep trust visible at all times.

Required UI elements:

- calibration validity state,
- session validity state,
- active profile name,
- warning list,
- provenance summary,
- formula detail link.

Required user outcomes:

- know whether the graphs are trustworthy,
- see if a result is provisional,
- trace a questionable output back to calibration or channel issues.

---

## 5. Recommended MVP Layout

The MVP should prefer one strong desktop layout rather than many weak layouts.

Recommended layout:

- top bar for session and profile selection,
- left navigation rail for the five main areas,
- main content region for graphs or calibration tools,
- right-side status panel for validity, warnings, and summary,
- bottom event or detail drawer for cursor readouts and formula details.

This arrangement works because it preserves constant access to status while keeping the main graph area large enough to be useful.

---

## 6. Required UI Elements by Function

### 6.1 Session Import Elements

- drag-and-drop zone,
- file browser button,
- import progress indicator,
- session metadata card,
- channel detection table,
- import warnings list.

### 6.2 Calibration Elements

- validity badge for each calibration section,
- incomplete-field warnings,
- measured-versus-estimated indicator,
- fit quality summary,
- save and version profile controls,
- preview graph for the active calibration screen.

### 6.3 Analysis Elements

- front and rear travel toggles,
- graph legend,
- hover readout,
- synchronized vertical cursor,
- time zoom and reset buttons,
- filter or display toggle for derived traces,
- key metrics cards.

### 6.4 Interpretation Elements

- detected observations list,
- likely causes list,
- calibration confidence note,
- comparison summary note,
- user notes field.

These interpretation elements should remain advisory, not prescriptive.

---

## 7. Core Graph Panels Required in the MVP

The MVP analysis workspace should revolve around three graph families.

### 7.1 Position Histogram Panel

Purpose:

- show travel occupancy,
- reveal ride height and deep-travel usage.

Required elements:

- front or rear selector,
- histogram plot,
- mean or median travel marker,
- bottom-out threshold marker,
- percentage statistics.

### 7.2 Velocity Histogram Panel

Purpose:

- show compression and rebound behavior,
- reveal harshness, packing, or rebound imbalance.

Required elements:

- histogram plot,
- compression side labeling,
- rebound side labeling,
- bin range control,
- key peak or occupancy statistics.

### 7.3 Telemetry Panel

Purpose:

- show travel, velocity, pitch, and acceleration over time.

Required elements:

- stacked or overlaid traces,
- synchronized cursor,
- zoom window,
- visible units for each axis,
- event selection.

---

## 8. Calibration Visibility Requirements

Because calibration quality determines whether the software is trustworthy, the MVP UI must keep calibration visible.

Required visibility rules:

- every session shows the active profile name,
- every graph shows whether its upstream calibration is valid or provisional,
- incomplete calibration disables or flags dependent interpretations,
- formula detail is accessible from the UI,
- provenance status is visible for important constants.

The user should never have to guess whether a graph is based on measured constants, estimated constants, or missing constants.

---

## 9. Minimum Navigation Model

The MVP should use simple navigation, for example:

1. Import
2. Calibration
3. Analysis
4. Compare
5. Session Details

This keeps the workflow obvious and prevents the application from feeling like a generic dashboard shell.

---

## 10. Required Empty, Warning, and Error States

The MVP needs strong state handling.

### 10.1 Empty States

Required cases:

- no session loaded,
- no calibration profile selected,
- no comparison session selected.

Each empty state should explain the next required action.

### 10.2 Warning States

Required cases:

- incomplete calibration,
- missing sensor channel,
- weak fit quality,
- estimated pitch reference,
- low-confidence velocity processing.

Warnings should not be buried inside modal dialogs. They should remain visible in the status panel.

### 10.3 Error States

Required cases:

- import failure,
- unreadable file,
- incompatible sample rate metadata,
- missing mandatory channels,
- failed profile validation.

Errors should explain what failed and what the user can do next.

---

## 11. Minimum Comparison Features

The MVP comparison workflow should support:

- one baseline session,
- one comparison session,
- overlay or side-by-side graphs,
- delta statistics for travel occupancy and velocity behavior,
- notes describing the physical setup change.

This is enough to make the product useful for actual setup iteration.

---

## 12. Formula and Provenance Access in the MVP

The MVP does not need a full engineering report generator, but it does need formula transparency.

Required elements:

- formula detail drawer or modal,
- active constant list,
- validity state display,
- provenance summary such as measured, fitted, estimated, or imported.

This is especially important for advanced users who need confidence in what the UI is actually displaying.

---

## 13. MVP Success Criteria

The MVP is successful if a user can:

1. import a DAQ file,
2. assign or create a valid calibration profile,
3. view the three main graph families,
4. understand whether the data is trustworthy,
5. compare two sessions,
6. make a defensible tuning decision based on the outputs.

If any of those steps are missing, the product is still a partial prototype rather than an MVP.

---

## 14. Conclusion

The MVP UI for this product should be deliberately narrow and strong. It should not attempt to expose every possible engineering capability in the first release. Instead, it should focus on the smallest interface that makes suspension DAQ interpretation genuinely useful: reliable import, visible calibration status, strong graph panels, clear comparison, and traceable engineering context.

That is the correct MVP boundary for this software. It gives the user a complete loop from raw data to tuning action without hiding the calibration and confidence logic that makes the output credible.