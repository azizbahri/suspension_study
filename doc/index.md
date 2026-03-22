# Suspension DAQ Documentation Index

This directory contains three categories of material:

- theoretical notes that define the measurement, signal-processing, and tuning framework,
- software-design notes that describe applications built on that framework,
- implementation-facing notes that describe how the product should actually be assembled.

## Primary Document

- [overview.md](overview.md): Main DAQ framework, equations, and interpretation workflow for suspension tuning.

## Supporting Technical Notes

- [hardware_measurement_report.md](hardware_measurement_report.md): Detailed explanation of the DAQ hardware stack, required measurements, ADC resolution, IMU ranges, and logger sample-rate requirements.
- [displacement_translation_report.md](displacement_translation_report.md): Detailed derivation of front and rear displacement translation, calibration constants, and rear-linkage polynomial fitting.
- [velocity_calculation_report.md](velocity_calculation_report.md): Detailed explanation of numerical differentiation, filtering, DAQ implementation, and wheel-versus-shaft velocity interpretation.
- [pitch_angle_report.md](pitch_angle_report.md): Detailed explanation of gyroscope integration, bias control, numerical integration, and pitch-angle drift management.
- [graphical_analysis_report.md](graphical_analysis_report.md): Detailed explanation of the travel histogram, velocity histogram, telemetry trace, and the axis formulas used to construct them.
- [spring_rate_preload_report.md](spring_rate_preload_report.md): Detailed explanation of how Graph 1 distinguishes preload errors from spring-rate errors, with interpretation logic and worked examples.
- [compression_damping_report.md](compression_damping_report.md): Detailed explanation of how the compression side of Graph 2 is used to diagnose harshness, brake dive, and low-speed versus high-speed compression behavior.
- [rebound_damping_report.md](rebound_damping_report.md): Detailed explanation of how the rebound side of Graph 2 and telemetry are used to diagnose packing, pogo behavior, and rebound-damping balance.

## Software Design Notes

- [software/README.md](software/README.md): Entry point for product and software-design notes.
- [software/index.md](software/index.md): Top-level software-design index.
- [software/product/daq_visualization_software_report.md](software/product/daq_visualization_software_report.md): Product overview of a visualization tool that imports DAQ logs, generates the main analysis graphs, and supports tuning decisions.
- [software/calibration/calibration_profile_workflow.md](software/calibration/calibration_profile_workflow.md): Calibration workflow for building and validating the constants behind the analysis formulas.

## Implementation Notes

- [implementation/README.md](implementation/README.md): Entry point for backend contract, data-structure, and delivery-planning notes.
- [implementation/api_contract.md](implementation/api_contract.md): Service contract for session import, calibration, analysis, and comparison.
- [implementation/communication_architecture.md](implementation/communication_architecture.md): Communication model for a React frontend and Python backend in local and future remote deployment.
- [implementation/backend_data_structures.md](implementation/backend_data_structures.md): Canonical backend object model used across persistence and API layers.
- [implementation/implementation_roadmap.md](implementation/implementation_roadmap.md): Recommended build sequence and MVP slicing strategy.

## Recommended Reading Order

1. [overview.md](overview.md)
2. [hardware_measurement_report.md](hardware_measurement_report.md)
3. [displacement_translation_report.md](displacement_translation_report.md)
4. [velocity_calculation_report.md](velocity_calculation_report.md)
5. [pitch_angle_report.md](pitch_angle_report.md)
6. [graphical_analysis_report.md](graphical_analysis_report.md)
7. [spring_rate_preload_report.md](spring_rate_preload_report.md)
8. [compression_damping_report.md](compression_damping_report.md)
9. [rebound_damping_report.md](rebound_damping_report.md)

## Software Reading Order

1. [overview.md](overview.md)
2. [software/README.md](software/README.md)
3. [software/index.md](software/index.md)
4. [software/product/daq_visualization_software_report.md](software/product/daq_visualization_software_report.md)
5. [software/calibration/calibration_profile_workflow.md](software/calibration/calibration_profile_workflow.md)

## Implementation Reading Order

1. [software/product/daq_visualization_software_report.md](software/product/daq_visualization_software_report.md)
2. [software/calibration/calibration_profile_workflow.md](software/calibration/calibration_profile_workflow.md)
3. [software/calibration/calibration_profile_data_model.md](software/calibration/calibration_profile_data_model.md)
4. [implementation/README.md](implementation/README.md)
5. [implementation/api_contract.md](implementation/api_contract.md)
6. [implementation/communication_architecture.md](implementation/communication_architecture.md)
7. [implementation/backend_data_structures.md](implementation/backend_data_structures.md)
8. [implementation/implementation_roadmap.md](implementation/implementation_roadmap.md)