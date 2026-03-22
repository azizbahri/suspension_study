# Suspension DAQ Software Design Notes

This folder contains product and software-design documents built on top of the theoretical framework in the parent [doc](../README.md) directory.

The documents here are not part of the core derivation set. They describe how the theory can be turned into a usable software product for data import, visualization, comparison, and tuning interpretation.

The software documents are organized into subdirectories so product design and calibration design can evolve independently.

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

## Relationship to the Theory Notes

Read the theory documents in the parent folder first if you want the mathematical and mechanical basis for the software:

1. [../overview.md](../overview.md)
2. [../hardware_measurement_report.md](../hardware_measurement_report.md)
3. [../displacement_translation_report.md](../displacement_translation_report.md)
4. [../velocity_calculation_report.md](../velocity_calculation_report.md)
5. [../pitch_angle_report.md](../pitch_angle_report.md)
6. [../graphical_analysis_report.md](../graphical_analysis_report.md)
7. [../spring_rate_preload_report.md](../spring_rate_preload_report.md)
8. [../compression_damping_report.md](../compression_damping_report.md)
9. [../rebound_damping_report.md](../rebound_damping_report.md)