# Suspension DAQ Documentation

This folder is split into three layers:

- the theoretical foundation of the suspension-analysis framework,
- software-design documents that describe how the framework could be turned into a user-facing product,
- implementation-facing documents that define backend contracts, data structures, and delivery sequencing.

## Start Here

- [foundation/overview.md](foundation/overview.md): Main DAQ framework, equations, graph definitions, and tuning workflow

## Foundation Documents

- [foundation/README.md](foundation/README.md): Entry point for the theory and analysis foundation notes
- [foundation/index.md](foundation/index.md): Foundation index and reading order
- [foundation/overview.md](foundation/overview.md): Main DAQ framework, equations, graph definitions, and tuning workflow
- [foundation/hardware_measurement_report.md](foundation/hardware_measurement_report.md): Hardware architecture, sensor roles, required measurements, ADC resolution, and logger sample-rate reasoning
- [foundation/displacement_translation_report.md](foundation/displacement_translation_report.md): Front and rear displacement translation, calibration constants, and rear-linkage fitting
- [foundation/velocity_calculation_report.md](foundation/velocity_calculation_report.md): Numerical differentiation, filtering, DAQ implementation, and wheel-versus-shaft velocity
- [foundation/pitch_angle_report.md](foundation/pitch_angle_report.md): Gyroscope integration, bias control, numerical integration, and pitch-angle drift
- [foundation/graphical_analysis_report.md](foundation/graphical_analysis_report.md): Travel histogram, velocity histogram, telemetry trace, and axis formulas
- [foundation/spring_rate_preload_report.md](foundation/spring_rate_preload_report.md): Using Graph 1 to distinguish preload errors from spring-rate errors
- [foundation/compression_damping_report.md](foundation/compression_damping_report.md): Using the compression side of Graph 2 to diagnose harshness and brake dive
- [foundation/rebound_damping_report.md](foundation/rebound_damping_report.md): Using the rebound side of Graph 2 and telemetry to diagnose packing and pogo behavior

## Software Design

- [software-design/README.md](software-design/README.md): Entry point for product, calibration, UI, and technology design notes
- [software-design/index.md](software-design/index.md): Top-level index for software design material
- [software-design/product/daq_visualization_software_report.md](software-design/product/daq_visualization_software_report.md): Product overview for a DAQ visualization application built on the theoretical framework
- [software-design/calibration/calibration_profile_workflow.md](software-design/calibration/calibration_profile_workflow.md): Calibration-profile workflow for all derived formulas

## Implementation Planning

- [implementation/README.md](implementation/README.md): Entry point for implementation-facing notes that convert the design into backend contracts and build phases
- [implementation/api_contract.md](implementation/api_contract.md): Application API contract for session import, calibration, analysis, and comparison
- [implementation/c4_architecture.md](implementation/c4_architecture.md): C4 architecture note covering system context, containers, and backend component boundaries
- [implementation/communication_architecture.md](implementation/communication_architecture.md): Communication model between the React frontend and Python backend, including local API and future cloud options
- [implementation/backend_data_structures.md](implementation/backend_data_structures.md): Canonical backend-side objects for sessions, profiles, validation, analysis, and comparison
- [implementation/implementation_roadmap.md](implementation/implementation_roadmap.md): Delivery sequence for backend modules, frontend integration, and MVP slices

## Progress Tracking

- [tracking/repository_progress.md](tracking/repository_progress.md): Repository-wide progress tracker covering docs, contracts, frontend, backend, analysis, comparison, and hardening

## Suggested Reading Order

1. [foundation/overview.md](foundation/overview.md)
2. [foundation/hardware_measurement_report.md](foundation/hardware_measurement_report.md)
3. [foundation/displacement_translation_report.md](foundation/displacement_translation_report.md)
4. [foundation/velocity_calculation_report.md](foundation/velocity_calculation_report.md)
5. [foundation/pitch_angle_report.md](foundation/pitch_angle_report.md)
6. [foundation/graphical_analysis_report.md](foundation/graphical_analysis_report.md)
7. [foundation/spring_rate_preload_report.md](foundation/spring_rate_preload_report.md)
8. [foundation/compression_damping_report.md](foundation/compression_damping_report.md)
9. [foundation/rebound_damping_report.md](foundation/rebound_damping_report.md)

## Software Reading Path

1. [foundation/overview.md](foundation/overview.md)
2. [software-design/README.md](software-design/README.md)
3. [software-design/index.md](software-design/index.md)
4. [software-design/product/daq_visualization_software_report.md](software-design/product/daq_visualization_software_report.md)
5. [software-design/calibration/calibration_profile_workflow.md](software-design/calibration/calibration_profile_workflow.md)

## Implementation Reading Path

1. [software-design/product/daq_visualization_software_report.md](software-design/product/daq_visualization_software_report.md)
2. [software-design/calibration/calibration_profile_workflow.md](software-design/calibration/calibration_profile_workflow.md)
3. [software-design/calibration/calibration_profile_data_model.md](software-design/calibration/calibration_profile_data_model.md)
4. [implementation/README.md](implementation/README.md)
5. [implementation/api_contract.md](implementation/api_contract.md)
6. [implementation/c4_architecture.md](implementation/c4_architecture.md)
7. [implementation/communication_architecture.md](implementation/communication_architecture.md)
8. [implementation/backend_data_structures.md](implementation/backend_data_structures.md)
9. [implementation/implementation_roadmap.md](implementation/implementation_roadmap.md)

## Legacy Index

The original index remains available in [index.md](index.md).