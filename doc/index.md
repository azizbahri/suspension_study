# Suspension DAQ Documentation Index

This directory contains the main framework document and three supporting technical notes that expand the core mathematical sections.

## Primary Document

- [overview.md](overview.md): Main DAQ framework, equations, and interpretation workflow for suspension tuning.

## Supporting Technical Notes

- [displacement_translation_report.md](displacement_translation_report.md): Detailed derivation of front and rear displacement translation, calibration constants, and rear-linkage polynomial fitting.
- [velocity_calculation_report.md](velocity_calculation_report.md): Detailed explanation of numerical differentiation, filtering, DAQ implementation, and wheel-versus-shaft velocity interpretation.
- [pitch_angle_report.md](pitch_angle_report.md): Detailed explanation of gyroscope integration, bias control, numerical integration, and pitch-angle drift management.
- [graphical_analysis_report.md](graphical_analysis_report.md): Detailed explanation of the travel histogram, velocity histogram, telemetry trace, and the axis formulas used to construct them.
- [spring_rate_preload_report.md](spring_rate_preload_report.md): Detailed explanation of how Graph 1 distinguishes preload errors from spring-rate errors, with interpretation logic and worked examples.
- [compression_damping_report.md](compression_damping_report.md): Detailed explanation of how the compression side of Graph 2 is used to diagnose harshness, brake dive, and low-speed versus high-speed compression behavior.
- [rebound_damping_report.md](rebound_damping_report.md): Detailed explanation of how the rebound side of Graph 2 and telemetry are used to diagnose packing, pogo behavior, and rebound-damping balance.

## Recommended Reading Order

1. [overview.md](overview.md)
2. [displacement_translation_report.md](displacement_translation_report.md)
3. [velocity_calculation_report.md](velocity_calculation_report.md)
4. [pitch_angle_report.md](pitch_angle_report.md)
5. [graphical_analysis_report.md](graphical_analysis_report.md)
6. [spring_rate_preload_report.md](spring_rate_preload_report.md)
7. [compression_damping_report.md](compression_damping_report.md)
8. [rebound_damping_report.md](rebound_damping_report.md)