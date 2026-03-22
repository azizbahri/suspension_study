# Suspension DAQ Documentation Index

This directory contains three categories of material:

- theoretical notes that define the measurement, signal-processing, and tuning framework,
- software-design notes that describe applications built on that framework,
- implementation-facing notes that describe how the product should actually be assembled.

## Primary Document

- [foundation/overview.md](foundation/overview.md): Main DAQ framework, equations, and interpretation workflow for suspension tuning.

## Supporting Technical Notes

- [foundation/README.md](foundation/README.md): Entry point for the theory and analysis foundation notes.
- [foundation/index.md](foundation/index.md): Foundation index and reading order.
- [foundation/hardware_measurement_report.md](foundation/hardware_measurement_report.md): Detailed explanation of the DAQ hardware stack, required measurements, ADC resolution, IMU ranges, and logger sample-rate requirements.
- [foundation/displacement_translation_report.md](foundation/displacement_translation_report.md): Detailed derivation of front and rear displacement translation, calibration constants, and rear-linkage polynomial fitting.
- [foundation/velocity_calculation_report.md](foundation/velocity_calculation_report.md): Detailed explanation of numerical differentiation, filtering, DAQ implementation, and wheel-versus-shaft velocity interpretation.
- [foundation/pitch_angle_report.md](foundation/pitch_angle_report.md): Detailed explanation of gyroscope integration, bias control, numerical integration, and pitch-angle drift management.
- [foundation/graphical_analysis_report.md](foundation/graphical_analysis_report.md): Detailed explanation of the travel histogram, velocity histogram, telemetry trace, and the axis formulas used to construct them.
- [foundation/spring_rate_preload_report.md](foundation/spring_rate_preload_report.md): Detailed explanation of how Graph 1 distinguishes preload errors from spring-rate errors, with interpretation logic and worked examples.
- [foundation/compression_damping_report.md](foundation/compression_damping_report.md): Detailed explanation of how the compression side of Graph 2 is used to diagnose harshness, brake dive, and low-speed versus high-speed compression behavior.
- [foundation/rebound_damping_report.md](foundation/rebound_damping_report.md): Detailed explanation of how the rebound side of Graph 2 and telemetry are used to diagnose packing, pogo behavior, and rebound-damping balance.

## Software Design Notes

- [software-design/README.md](software-design/README.md): Entry point for product and software-design notes.
- [software-design/index.md](software-design/index.md): Top-level software-design index.
- [software-design/product/daq_visualization_software_report.md](software-design/product/daq_visualization_software_report.md): Product overview of a visualization tool that imports DAQ logs, generates the main analysis graphs, and supports tuning decisions.
- [software-design/calibration/calibration_profile_workflow.md](software-design/calibration/calibration_profile_workflow.md): Calibration workflow for building and validating the constants behind the analysis formulas.

## Implementation Notes

- [implementation/README.md](implementation/README.md): Entry point for backend contract, data-structure, and delivery-planning notes.
- [implementation/api_contract.md](implementation/api_contract.md): Service contract for session import, calibration, analysis, and comparison.
- [implementation/c4_architecture.md](implementation/c4_architecture.md): C4 architecture note for system context, containers, and backend components.
- [implementation/communication_architecture.md](implementation/communication_architecture.md): Communication model for a React frontend and Python backend in local and future remote deployment.
- [implementation/backend_data_structures.md](implementation/backend_data_structures.md): Canonical backend object model used across persistence and API layers.
- [implementation/implementation_roadmap.md](implementation/implementation_roadmap.md): Recommended build sequence and MVP slicing strategy.

## Recommended Reading Order

1. [foundation/overview.md](foundation/overview.md)
2. [foundation/hardware_measurement_report.md](foundation/hardware_measurement_report.md)
3. [foundation/displacement_translation_report.md](foundation/displacement_translation_report.md)
4. [foundation/velocity_calculation_report.md](foundation/velocity_calculation_report.md)
5. [foundation/pitch_angle_report.md](foundation/pitch_angle_report.md)
6. [foundation/graphical_analysis_report.md](foundation/graphical_analysis_report.md)
7. [foundation/spring_rate_preload_report.md](foundation/spring_rate_preload_report.md)
8. [foundation/compression_damping_report.md](foundation/compression_damping_report.md)
9. [foundation/rebound_damping_report.md](foundation/rebound_damping_report.md)

## Software Reading Order

1. [foundation/overview.md](foundation/overview.md)
2. [software-design/README.md](software-design/README.md)
3. [software-design/index.md](software-design/index.md)
4. [software-design/product/daq_visualization_software_report.md](software-design/product/daq_visualization_software_report.md)
5. [software-design/calibration/calibration_profile_workflow.md](software-design/calibration/calibration_profile_workflow.md)

## Implementation Reading Order

1. [software-design/product/daq_visualization_software_report.md](software-design/product/daq_visualization_software_report.md)
2. [software-design/calibration/calibration_profile_workflow.md](software-design/calibration/calibration_profile_workflow.md)
3. [software-design/calibration/calibration_profile_data_model.md](software-design/calibration/calibration_profile_data_model.md)
4. [implementation/README.md](implementation/README.md)
5. [implementation/api_contract.md](implementation/api_contract.md)
6. [implementation/c4_architecture.md](implementation/c4_architecture.md)
7. [implementation/communication_architecture.md](implementation/communication_architecture.md)
8. [implementation/backend_data_structures.md](implementation/backend_data_structures.md)
9. [implementation/implementation_roadmap.md](implementation/implementation_roadmap.md)