# Suspension Study

This repository contains a documentation set for motorcycle suspension data acquisition, signal processing, graphical interpretation, tuning decisions, and software concepts built on that theory.

It now also includes an early frontend implementation for the suspension DAQ application shell described in the documentation.

## Documentation

The main documentation lives in [doc/README.md](doc/README.md).

This repository also includes workspace-specific Copilot instructions in [.github/copilot-instructions.md](.github/copilot-instructions.md) so future requests are evaluated with the project's hardware-plus-software engineering perspective.

Repository-wide implementation and delivery progress is tracked in [doc/tracking/repository_progress.md](doc/tracking/repository_progress.md).

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

## Frontend

The repository includes a React and TypeScript frontend prototype under [frontend](frontend).

Current frontend scope:

- application shell and navigation,
- import workflow UI,
- calibration workflow shell,
- persistent status and trust panel,
- placeholder routes for later analysis and comparison work.

### Frontend Setup

Prerequisites:

- Node.js 20 or newer,
- npm.

Install dependencies:

```powershell
Set-Location frontend
npm install
```

### Run the Frontend

Start the Vite development server:

```powershell
Set-Location frontend
npm run dev
```

By default, Vite serves the app locally at `http://localhost:5173`.

### Build the Frontend

Create a production build:

```powershell
Set-Location frontend
npm run build
```

The build output is written to [frontend/dist](frontend/dist).

### Lint the Frontend

Run ESLint:

```powershell
Set-Location frontend
npm run lint
```

### Frontend Notes

- The frontend is currently mock-data driven and does not yet call a live Python backend.
- The intended long-term architecture is a React and TypeScript frontend with a Python analysis service boundary, as described in the documentation.