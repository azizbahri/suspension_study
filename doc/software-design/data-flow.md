# End-to-End Data Flow

> This document traces the complete signal chain from physical sensor hardware through CSV ingestion, the signal processing pipeline, and finally to the rendered UI charts and diagnostic advice.

---

## Overview

```mermaid
flowchart TD
    subgraph HW ["① Hardware  (on-bike)"]
        SENSOR["Potentiometer / IMU\nPhysical position, rate, acceleration"]
        MCU["Microcontroller\nADC @ fs Hz → 12-bit counts"]
        FILE["CSV file on disk\ntime_s, front_raw, rear_raw,\ngyro_y_raw, accel_x/y/z_raw"]
        SENSOR --> MCU --> FILE
    end

    subgraph IMPORT ["② Import  (ImportPage → POST /sessions/import)"]
        PATH["User provides CSV path\n+ session name\n+ bike slug\n+ column mapping\n+ velocity mode"]
        META["Session metadata\nstored in\n~/.suspension_study/sessions/<id>/session.json"]
        PATH --> META
    end

    subgraph ANAL ["③ Analysis  (AnalyzePage → POST /analyze/:id)"]
        LOAD["Load CSV via pandas\nLoad BikeProfile from storage"]
        PIPE["process_session()\nsignal processing pipeline"]
        ADVIS["run_advisor()\n7 diagnostic rules"]
        RSTORE["result.json saved\nsession.analyzed = true"]
        LOAD --> PIPE --> ADVIS --> RSTORE
    end

    subgraph UI ["④ Visualisation  (AnalyzePage)"]
        TH["TravelHistogram ×2\n(front + rear)"]
        VH["VelocityHistogram ×2\n(front + rear)"]
        PC["PitchChart\n(pitch + accel X)"]
        DC["DiagnosticCard ×N\n(sorted: critical → warning → info)"]
        TH & VH & PC & DC
    end

    FILE -->|"csv_path provided by user"| PATH
    META -->|"POST /analyze/:id"| LOAD
    RSTORE -->|"AnalysisResult JSON"| TH & VH & PC & DC
```

---

## Stage 1 — Hardware Signal Acquisition

The on-bike DAQ system samples physical signals at a fixed rate `fs_hz` (default 250 Hz) using a microcontroller with a 12-bit ADC and 5 V reference.

| Column | Physical quantity | Sensor |
|--------|-----------------|--------|
| `front_raw` | Front fork sensor counts | Linear potentiometer |
| `rear_raw` | Rear shock sensor counts | Linear potentiometer |
| `gyro_y_raw` | Pitch-rate counts | MPU-6050 gyroscope (Y axis) |
| `accel_x_raw` | Longitudinal acceleration counts | MPU-6050 accelerometer (X=forward) |
| `accel_y_raw` | Lateral acceleration counts | MPU-6050 accelerometer (Y=left) |
| `accel_z_raw` | Vertical acceleration counts | MPU-6050 accelerometer (Z=up) |

IMU sign convention: X forward, Z up. At rest with pitch φ:
- `ax_specific = −g · sin(φ)`
- `az_specific = g · cos(φ)`

The CSV may optionally include a `time_s` column (actual timestamps). If absent, sample indices × `1/fs_hz` are used.

---

## Stage 2 — Import (`POST /sessions/import`)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as ImportPage
    participant BE as FastAPI
    participant FS as File system

    U->>FE: Fill form (path, name, bike, columns)
    FE->>BE: POST /api/v1/sessions/import
    BE->>FS: Path.exists(csv_path)  ← validates file exists
    BE->>FS: Write session.json  ← creates sessions/<uuid>/session.json
    BE-->>FE: Session { id, name, bike_slug, analyzed: false, ... }
    FE-->>U: "Session imported successfully" + "Analyze Now" button
```

**Column mapping** (`ColumnMap`) is stored in the session, not the CSV. This allows re-importing the same file with a different column layout or bike profile without modifying the raw data.

**Polarity flags** `invert_front` / `invert_rear` negate the raw counts before any processing — useful when a potentiometer is mounted in the reverse orientation.

---

## Stage 3 — Signal Processing Pipeline (`process_session`)

```mermaid
flowchart LR
    subgraph INPUT ["Inputs"]
        DF["pandas DataFrame\n(raw CSV columns)"]
        BIKE["BikeProfile\n(calibration + filter params)"]
        CM["ColumnMap\n(column names + polarity)"]
    end

    subgraph DISP ["Displacement"]
        ADC2V["ADC → Voltage\nV = count / (2^N-1) × Vref"]
        FSTROKE["Front stroke\ns = (V − V0_f) × C_f  [mm]"]
        FTRAVEL["Front wheel travel\nW_f = s × cos(θ)  [mm]"]
        RSTROKE["Rear shock stroke\ns = (V − V0_r) × C_r  [mm]"]
        RTRAVEL["Rear wheel travel\nW_r = a·s² + b·s + c  [mm]"]
        ADC2V --> FSTROKE --> FTRAVEL
        ADC2V --> RSTROKE --> RTRAVEL
    end

    subgraph FILT ["Filtering"]
        LPF_F["Front LPF\nButterworth 2nd-order\nf_c = 20 Hz, zero-phase"]
        LPF_R["Rear LPF\nButterworth 2nd-order\nf_c = 20 Hz, zero-phase"]
        FTRAVEL --> LPF_F
        RTRAVEL --> LPF_R
    end

    subgraph VEL ["Velocity"]
        WVEL_F["Front wheel vel\nv = −ΔW_f / Δt  [mm/s]"]
        WVEL_R["Rear wheel vel\nv = −ΔW_r / Δt  [mm/s]"]
        LPF_F --> WVEL_F
        LPF_R --> WVEL_R
    end

    subgraph PITCH ["Pitch (Complementary Filter)"]
        GYRO2DEG["Gyro → deg/s\nω = counts / sensitivity"]
        BIAS["Bias correction\nω_corr = ω − mean(ω[:N_stat])"]
        GLPF["Gyro LPF\nf_c = 10 Hz"]
        PHIACC["Accel pitch\nϕ_acc = atan2(−ax, √(ay²+az²))"]
        CF["Complementary filter\nϕ[n] = α·(ϕ[n-1]+Δgyro) + (1-α)·ϕ_acc[n]\nα = 0.98"]
        GYRO2DEG --> BIAS --> GLPF --> CF
        PHIACC --> CF
    end

    subgraph HIST ["Histograms"]
        TH_F["Front TravelHistogram\n10 bins × 10%, 0–100%"]
        TH_R["Rear TravelHistogram"]
        VH_F["Front VelocityHistogram\n60 bins × 50 mm/s, ±1500"]
        VH_R["Rear VelocityHistogram"]
        LPF_F --> TH_F
        LPF_R --> TH_R
        WVEL_F --> VH_F
        WVEL_R --> VH_R
    end

    subgraph OUTPUT ["AnalysisResult"]
        RES["front_travel\nrear_travel\nfront_velocity\nrear_velocity\npitch\ndiagnostics\nduration_s\nsample_count"]
    end

    INPUT --> ADC2V
    TH_F & TH_R & VH_F & VH_R & CF --> RES
```

### Displacement equations

```
ADC → Voltage:
    V = count / (2^N − 1) × V_ref                        [V]

Front fork:
    s_f   = (V − V0_front) × C_front                    [mm, fork-axis stroke]
    W_f   = s_f × cos(fork_angle_deg)                   [mm, vertical wheel travel]

Rear shock:
    s_r   = (V − V0_rear) × C_rear                      [mm, shock stroke]
    W_r   = linkage_a × s_r² + linkage_b × s_r + linkage_c  [mm, wheel travel]

Travel %:
    P = 100 × W / W_max                                  [%]
```

### Filtering

A **2nd-order Butterworth** low-pass filter applied **zero-phase** via `scipy.signal.filtfilt` (forward-backward pass eliminates phase delay). Used for both displacement (20 Hz cut-off) and gyro rate (10 Hz cut-off). Minimum 13 samples required; shorter signals pass through unfiltered.

### Velocity sign convention

> **Negative = compression, positive = rebound.**

The wheel travel `W` increases as the suspension compresses (sensor extends). The time derivative is negated so that compression events appear as negative velocity in the histogram.

| Mode | Formula |
|------|---------|
| Wheel front | `v = −(W_f[n] − W_f[n-1]) / dt` |
| Shaft front | `v_shaft = v_wheel / cos(θ)` (projects vertical to fork-axis) |
| Shaft rear | Differentiates shock stroke directly: `v = −Δs_r / dt` (bypasses the non-constant linkage motion ratio) |

### Complementary filter

The filter permanently blends gyro integration (fast, drift-prone) with accelerometer-derived pitch (slow, noise-immune). The `alpha = 0.98` weighting gives the gyro 98 % influence over the short term while the accelerometer corrects drift over ~1–2 s. **Gyro-only integration is never used.**

```
ϕ_acc[n] = atan2(−ax_g[n], √(ay_g²[n] + az_g²[n]))      [deg]

ϕ[n]     = α × (ϕ[n-1] + 0.5 × (ω_f[n] + ω_f[n-1]) × dt)
           + (1 − α) × ϕ_acc[n]
```

Trapezoidal (midpoint) integration of the gyro increment suppresses numerical drift caused by the backward-Euler scheme.

---

## Stage 4 — Diagnostic Advisor (`run_advisor`)

```mermaid
graph TD
    RESULT["AnalysisResult"]
    BIKE["BikeProfile"]

    R1["deep_travel_tail\npct_above_80 > 10%"]
    R2["travel_center_shifted_right\npeak_center > 50%"]
    R3["travel_center_shifted_left\npeak_center < 20%"]
    R4["harsh_hs_compression\nhs_compression_pct > 20%"]
    R5["brake_dive\npitch < −15° + LS comp dominant"]
    R6["compression_asymmetry\ncomp > reb × 1.5"]
    R7["rebound_kickback\nreb > comp × 1.5"]

    RESULT & BIKE --> R1 & R2 & R3 & R4 & R5 & R6 & R7

    NOTES["list of DiagnosticNote\n(rule_id, severity, title, message, action)"]
    R1 & R2 & R3 & R4 & R5 & R6 & R7 -->|"non-None results"| NOTES
```

Each rule is a pure function. Rules that do not trigger return `None` and are silently dropped. Exceptions inside rules are swallowed so one misbehaving rule cannot abort the pipeline.

---

## Stage 5 — Storage and Retrieval

```
POST /analyze/:id
  ↓
process_session() → AnalysisResult
  ↓
session_store.save_result(session_id, result)  → sessions/<id>/result.json
session.analyzed = True
session_store.save_session(session)            → sessions/<id>/session.json
  ↓
Return AnalysisResult to frontend
```

**Subsequent reads** (GET /analyze/:id/result, POST /compare) load from `result.json` — no reprocessing.

---

## Stage 6 — Frontend Rendering

```mermaid
graph LR
    AR["AnalysisResult\n(in component state)"]

    TH_F["TravelHistogram\n(front)\nBarChart:\n- 10 orange bars\n- ReferenceLine x=30 (sag)\n- ReferenceLine x=80 (limit)"]
    TH_R["TravelHistogram\n(rear)"]
    VH_F["VelocityHistogram\n(front)\nBarChart:\n- red bars (compression)\n- green bars (rebound)\n- ReferenceLine x=0\n- ReferenceLine x=±150"]
    VH_R["VelocityHistogram\n(rear)"]
    PC["PitchChart\nLineChart:\n- blue: pitch °\n- amber: accel X (g)\n- dual Y-axes\n- downsampled if N>5000"]
    DC["DiagnosticCard ×N\nsorted critical→warning→info"]
    FOOT["Footer\nduration_s · sample_count · session_id"]

    AR --> TH_F & TH_R & VH_F & VH_R & PC & DC & FOOT
```

### Down-sampling in `PitchChart`

When `sampleCount > 5000` a step of 4 is applied before building `chartData`:

```ts
const step = sampleCount > 5000 ? 4 : 1;
const chartData = data.time_s
  .filter((_, i) => i % step === 0)
  .map((t, i) => ({ time: t.toFixed(2), pitch: data.pitch_deg[i * step], accel: data.accel_x_g[i * step] }));
```

A 30-second session at 250 Hz → 7 500 samples → rendered as ~1 875 points. This keeps the LineChart responsive without losing perceptible detail at the pixel level of a web chart.

### Diagnostic sort

Diagnostics are sorted by severity before rendering:

```ts
const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 } as const;
sortedDiagnostics = [...result.diagnostics].sort(
  (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
);
```

Critical issues always appear first, giving the rider the most urgent feedback at the top.

---

## Compare Flow

```mermaid
sequenceDiagram
    participant U as User
    participant CMP as ComparePage
    participant BE as FastAPI /compare
    participant FS as result.json files

    U->>CMP: Select 2–3 sessions + click Compare
    CMP->>BE: POST /compare { session_ids, granularity }
    loop for each session_id
        BE->>FS: load_result(session_id) → AnalysisResult
    end
    BE-->>CMP: CompareResponse { sessions: [...] }
    CMP->>CMP: Build overlaid chart data (one series per session)
    CMP-->>U: OverlaidTravelChart × 2\nOverlaidVelocityChart × 2\nSession summary table
```

The compare endpoint reads pre-computed `result.json` files; it does not re-run the pipeline. Sessions must be analyzed before they can be compared (the frontend shows them as "analyzed ✓" in the session list).

---

## Calibration Flow

Calibration is a separate stateless computation that feeds into a `BikeProfile` update.

```mermaid
sequenceDiagram
    participant U as User
    participant CP as CalibratePage
    participant CAL as /calibrate/front or /rear
    participant BK as /bikes/:slug (PUT)

    U->>CP: Enter calibration data points + click Fit
    CP->>CAL: POST /calibrate/front { strokes_mm, voltages_v }
    CAL-->>CP: { c_cal, v0, rmse }
    CP-->>U: Show result card (C_cal, V0, RMSE)
    U->>CP: Select bike + click Apply
    CP->>BK: PUT /bikes/t7 { c_front: c_cal, v0_front: v0 }
    BK-->>CP: Updated BikeProfile
    CP-->>U: React Query invalidates ['bikes'] → table refreshes
```

The same pattern applies to rear calibration, writing `linkage_a/b/c` back to the profile.
