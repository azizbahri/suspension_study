# Suspension DAQ Documentation

This folder is split into two layers:

- the theoretical core of the suspension-analysis framework,
- software-design documents that describe how the framework could be turned into a user-facing product.

## Start Here

- [overview.md](overview.md): Main DAQ framework, equations, graph definitions, and tuning workflow

## Theoretical Core

- [hardware_measurement_report.md](hardware_measurement_report.md): Hardware architecture, sensor roles, required measurements, ADC resolution, and logger sample-rate reasoning
- [displacement_translation_report.md](displacement_translation_report.md): Front and rear displacement translation, calibration constants, and rear-linkage fitting
- [velocity_calculation_report.md](velocity_calculation_report.md): Numerical differentiation, filtering, DAQ implementation, and wheel-versus-shaft velocity
- [pitch_angle_report.md](pitch_angle_report.md): Gyroscope integration, bias control, numerical integration, and pitch-angle drift
- [graphical_analysis_report.md](graphical_analysis_report.md): Travel histogram, velocity histogram, telemetry trace, and axis formulas
- [spring_rate_preload_report.md](spring_rate_preload_report.md): Using Graph 1 to distinguish preload errors from spring-rate errors
- [compression_damping_report.md](compression_damping_report.md): Using the compression side of Graph 2 to diagnose harshness and brake dive
- [rebound_damping_report.md](rebound_damping_report.md): Using the rebound side of Graph 2 and telemetry to diagnose packing and pogo behavior

## Software Design

- [software/README.md](software/README.md): Entry point for product and software-design notes
- [software/index.md](software/index.md): Top-level index for software product and calibration design notes
- [software/product/daq_visualization_software_report.md](software/product/daq_visualization_software_report.md): Product overview for a DAQ visualization application built on the theoretical framework
- [software/calibration/calibration_profile_workflow.md](software/calibration/calibration_profile_workflow.md): Calibration-profile workflow for all derived formulas

## Suggested Reading Order

1. [overview.md](overview.md)
2. [hardware_measurement_report.md](hardware_measurement_report.md)
3. [displacement_translation_report.md](displacement_translation_report.md)
4. [velocity_calculation_report.md](velocity_calculation_report.md)
5. [pitch_angle_report.md](pitch_angle_report.md)
6. [graphical_analysis_report.md](graphical_analysis_report.md)
7. [spring_rate_preload_report.md](spring_rate_preload_report.md)
8. [compression_damping_report.md](compression_damping_report.md)
9. [rebound_damping_report.md](rebound_damping_report.md)

## Software Reading Path

1. [overview.md](overview.md)
2. [software/README.md](software/README.md)
3. [software/index.md](software/index.md)
4. [software/product/daq_visualization_software_report.md](software/product/daq_visualization_software_report.md)
5. [software/calibration/calibration_profile_workflow.md](software/calibration/calibration_profile_workflow.md)

## Legacy Index

The original index remains available in [index.md](index.md).