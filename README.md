# Suspension Study

A post-processing desktop application for motorcycle suspension DAQ data. Upload a CSV from the logger, calibrate the sensors, and get travel histograms, velocity histograms, pitch telemetry, and tuning recommendations grounded in the physics documented here.

Primary target: **Yamaha Ténéré 700** (T7), with T7 linkage constants pre-populated. Other bikes can be added through the Calibrate page.

---

## Quick Start

Open two terminal windows from the repository root.

**Terminal 1 — API server:**

```bash
cd backend
pip install -e ".[dev]"        # first time only
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — UI:**

```bash
cd frontend
npm install                    # first time only
npm run dev
```

Open **`http://localhost:5173`** in a browser.

The API must be running for the UI to function. Interactive API docs are at **`http://localhost:8000/docs`**.

---

## Documentation

Theoretical framework: [doc/foundation/overview.md](doc/foundation/overview.md)  
Documentation index: [doc/README.md](doc/README.md)  
Frontend test plan: [doc/frontend_testing_plan.md](doc/frontend_testing_plan.md)

---

## Architecture

```
suspension_study/
├── backend/     # Python FastAPI — signal processing + REST API
└── frontend/    # React + TypeScript + Vite — UI
```

All data is stored locally (`~/.suspension_study/`). No cloud services.

---

## Backend

### Prerequisites

- Python 3.10 or newer
- pip

### Install

```bash
cd backend
pip install -e ".[dev]"
```

### Run

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

API is served at `http://localhost:8000/api/v1`.  
Interactive docs: `http://localhost:8000/docs`

### Run Tests

The test suite uses a hardware simulator that generates physically realistic DAQ CSV files from first principles (forward model → sensor quantization → noise). All 35 tests must pass before the backend is considered healthy.

```bash
cd backend
python -m pytest tests/ -v
```

---

## Frontend

### Prerequisites

- Node.js 20 or newer
- npm

### Install

```bash
cd frontend
npm install
```

### Run (development)

Start the backend first (see above), then:

```bash
cd frontend
npm run dev
```

App opens at `http://localhost:5173`.

### Build (production)

```bash
cd frontend
npm run build
```

Output is written to `frontend/dist/`.

---

## Workflow

1. **Import** — Paste the absolute path to a DAQ CSV file. Map column names to sensor channels. Select the bike profile and velocity quantity (wheel vs shaft).
2. **Calibrate** — Fit front linear calibration from a voltage-sweep. Fit rear linkage polynomial from a stroke-sweep. Manage bike profiles.
3. **Analyze** — Run signal processing on the session. View travel histogram, velocity histogram, pitch telemetry, and the tuning advisor diagnostics.
4. **Compare** — Select two or more sessions and overlay their histograms at session or segment granularity.

---

## CSV Format

The logger must produce a CSV with at minimum these columns (names are user-configurable in the Import page):

| Column | Description |
|--------|-------------|
| `time_s` | Elapsed time in seconds (optional — if absent, timestamps are generated from `fs_hz`) |
| `front_raw` | Front potentiometer ADC count (12-bit integer) |
| `rear_raw` | Rear shock potentiometer ADC count (12-bit integer) |
| `gyro_y_raw` | IMU Y-axis gyroscope (signed int16, pitch rate) |
| `accel_x_raw` | IMU X-axis accelerometer (signed int16, longitudinal) |
| `accel_y_raw` | IMU Y-axis accelerometer (signed int16, lateral) |
| `accel_z_raw` | IMU Z-axis accelerometer (signed int16, vertical) |

Minimum sample rate: **250 Hz**.

---

## Signal Processing Pipeline

```
ADC counts → voltage → displacement (mm) → LPF (20 Hz Butterworth)
         → velocity (backward difference) → histogram

gyro raw → deg/s → LPF (10 Hz) → complementary filter with accel pitch → pitch trace
```

The complementary filter is always used (never gyro-only) with α = 0.98. See [doc/foundation/pitch_angle_report.md](doc/foundation/pitch_angle_report.md) for derivation.