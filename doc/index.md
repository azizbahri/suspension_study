# Suspension DAQ Documentation Index

This directory contains the main framework document and the supporting technical notes that expand the core mathematical sections, graph construction, and tuning logic.

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