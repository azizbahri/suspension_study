# Suspension DAQ Software Design Notes

This folder contains product and software-design documents built on top of the theoretical foundation in the parent [doc](../README.md) directory.

The documents here are not part of the core derivation set. They describe how the theory can be turned into a usable software product for data import, visualization, comparison, and tuning interpretation.

The software documents are organized into subdirectories so product design and calibration design can evolve independently.

They are also separated by concern so product definition, calibration logic, and UI definition can evolve without being mixed together.

Technology decisions and architecture notes are kept separate as well so implementation choices can evolve without rewriting the product and workflow notes.

## Software Index

- [index.md](index.md): Top-level index for the software-design documentation

## Product Design

- [product/README.md](product/README.md): Product-design notes index
- [product/daq_visualization_software_report.md](product/daq_visualization_software_report.md): Product-level overview of a DAQ visualization application for suspension analysis and tuning support

## Calibration Design

- [calibration/README.md](calibration/README.md): Calibration-design notes index
- [calibration/calibration_profile_workflow.md](calibration/calibration_profile_workflow.md): Detailed design note for building, validating, and maintaining calibration profiles for all derived formulas
- [calibration/calibration_profile_data_model.md](calibration/calibration_profile_data_model.md): Calibration profile schema, validity-state model, provenance fields, and revision metadata
- [calibration/front_travel_calibration_design.md](calibration/front_travel_calibration_design.md): Front calibration screen and workflow design
- [calibration/rear_travel_calibration_design.md](calibration/rear_travel_calibration_design.md): Rear calibration and linkage screen design
- [calibration/velocity_processing_design.md](calibration/velocity_processing_design.md): Velocity setup, filtering, and validation design
- [calibration/pitch_processing_design.md](calibration/pitch_processing_design.md): Pitch setup, bias, and validation design

## UI Design

- [ui/README.md](ui/README.md): UI-design notes index
- [ui/mvp_ui_document.md](ui/mvp_ui_document.md): MVP user-interface definition, required screens, and essential controls

## Technology Design

- [technology/README.md](technology/README.md): Technology and architecture notes index
- [technology/tech_stack_decision_note.md](technology/tech_stack_decision_note.md): Decision note recommending React, TypeScript, Tauri, and Python analysis services
- [technology/target_architecture.md](technology/target_architecture.md): Target architecture for a desktop-first product with future cloud and AI evolution

## Relationship to the Theory Notes

Read the foundation documents first if you want the mathematical and mechanical basis for the software:

1. [../foundation/overview.md](../foundation/overview.md)
2. [../foundation/hardware_measurement_report.md](../foundation/hardware_measurement_report.md)
3. [../foundation/displacement_translation_report.md](../foundation/displacement_translation_report.md)
4. [../foundation/velocity_calculation_report.md](../foundation/velocity_calculation_report.md)
5. [../foundation/pitch_angle_report.md](../foundation/pitch_angle_report.md)
6. [../foundation/graphical_analysis_report.md](../foundation/graphical_analysis_report.md)
7. [../foundation/spring_rate_preload_report.md](../foundation/spring_rate_preload_report.md)
8. [../foundation/compression_damping_report.md](../foundation/compression_damping_report.md)
9. [../foundation/rebound_damping_report.md](../foundation/rebound_damping_report.md)