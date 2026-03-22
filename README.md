# Suspension Study

This repository contains a documentation set for motorcycle suspension data acquisition, signal processing, graphical interpretation, tuning decisions, and software concepts built on that theory.

## Documentation

The main documentation lives in [doc/README.md](doc/README.md).

This repository also includes workspace-specific Copilot instructions in [.github/copilot-instructions.md](.github/copilot-instructions.md) so future requests are evaluated with the project's hardware-plus-software engineering perspective.

Key entry points:

- [doc/overview.md](doc/overview.md): Main framework document
- [doc/README.md](doc/README.md): Documentation index and reading guide
- [doc/software/README.md](doc/software/README.md): Software-design notes derived from the theoretical framework
- [doc/software/index.md](doc/software/index.md): Software product and calibration design index

## Scope

The current material covers two layers.

Theoretical core:

- displacement translation for front and rear suspension channels,
- velocity estimation and filtering,
- chassis pitch-angle estimation from IMU data,
- histogram and telemetry graph construction,
- spring-rate, preload, compression-damping, and rebound-damping interpretation.

Software-design material:

- product-level DAQ visualization concepts built on the core theory,
- calibration-design workflows for the formulas used by the software.