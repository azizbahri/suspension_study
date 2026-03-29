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

- See [index.md](index.md) for available software-design materials and planned content.

## Implementation Planning

- See [index.md](index.md) for implementation planning notes and roadmap links when available.

## Progress Tracking

- Repository progress tracker was removed from this branch; see [index.md](index.md) for current documentation status.

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

These software-design reading materials are planned but not present in this branch. See the documentation index for current available content: [index.md](index.md).

## Implementation Reading Path

Implementation reading material references are planned but not present in this branch. See [index.md](index.md) for the current documentation state.

## Legacy Index

The original index remains available in [index.md](index.md).