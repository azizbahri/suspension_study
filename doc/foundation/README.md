# Suspension DAQ Foundation Notes

This folder contains the theory and analysis foundation for the suspension DAQ work. These documents define the measurement chain, kinematic transformations, graph construction, and tuning interpretation logic that the software and implementation notes build on.

## Start Here

- [overview.md](overview.md): Main DAQ framework, equations, graph definitions, and tuning workflow

## Documents

- [hardware_measurement_report.md](hardware_measurement_report.md): Hardware architecture, sensor roles, required measurements, ADC resolution, and logger sample-rate reasoning
- [displacement_translation_report.md](displacement_translation_report.md): Front and rear displacement translation, calibration constants, and rear-linkage fitting
- [velocity_calculation_report.md](velocity_calculation_report.md): Numerical differentiation, filtering, DAQ implementation, and wheel-versus-shaft velocity
- [pitch_angle_report.md](pitch_angle_report.md): Gyroscope integration, bias control, numerical integration, and pitch-angle drift
- [graphical_analysis_report.md](graphical_analysis_report.md): Travel histogram, velocity histogram, telemetry trace, and axis formulas
- [spring_rate_preload_report.md](spring_rate_preload_report.md): Using Graph 1 to distinguish preload errors from spring-rate errors
- [compression_damping_report.md](compression_damping_report.md): Using the compression side of Graph 2 to diagnose harshness and brake dive
- [rebound_damping_report.md](rebound_damping_report.md): Using the rebound side of Graph 2 and telemetry to diagnose packing and pogo behavior

## Reading Path

1. [overview.md](overview.md)
2. [hardware_measurement_report.md](hardware_measurement_report.md)
3. [displacement_translation_report.md](displacement_translation_report.md)
4. [velocity_calculation_report.md](velocity_calculation_report.md)
5. [pitch_angle_report.md](pitch_angle_report.md)
6. [graphical_analysis_report.md](graphical_analysis_report.md)
7. [spring_rate_preload_report.md](spring_rate_preload_report.md)
8. [compression_damping_report.md](compression_damping_report.md)
9. [rebound_damping_report.md](rebound_damping_report.md)

## Related Tracks

- See the documentation index for Software Design and Implementation planning: [../index.md](../index.md)