import type { BikeProfile } from '../types/bike'
import type { Session, ColumnMap } from '../types/session'
import type { AnalysisResult } from '../types/analysis'
import type { DemoStatus } from '../api/demo'

// ── Bike ───────────────────────────────────────────────────────────────────
export const T7_BIKE: BikeProfile = {
  name: 'Yamaha Ténéré 700 (Test Profile)',
  slug: 't7_test',
  w_max_front_mm: 210.0,
  w_max_rear_mm: 210.0,
  fork_angle_deg: 27.0,
  c_front: 42.0,
  v0_front: 0.50,
  c_rear: 18.5,
  v0_rear: 0.40,
  linkage_a: -0.015,
  linkage_b: 4.20,
  linkage_c: 0.0,
  adc_bits: 12,
  v_ref: 5.0,
  fs_hz: 250.0,
  lpf_cutoff_disp_hz: 20.0,
  lpf_cutoff_gyro_hz: 10.0,
  complementary_alpha: 0.98,
  stationary_samples: 250,
  gyro_sensitivity: 16.4,
  accel_sensitivity: 2048.0,
  ls_threshold_mm_s: 150.0,
}

// ── Session ─────────────────────────────────────────────────────────────────
const DEFAULT_COLUMN_MAP: ColumnMap = {
  time_col: 'time_s',
  front_raw_col: 'front_raw',
  rear_raw_col: 'rear_raw',
  gyro_y_col: 'gyro_y_raw',
  accel_x_col: 'accel_x_raw',
  accel_y_col: 'accel_y_raw',
  accel_z_col: 'accel_z_raw',
  invert_front: false,
  invert_rear: false,
}

export const SESSION_1: Session = {
  id: 'session-1',
  name: 'Sunday Rocky Peak Run',
  bike_slug: 't7_test',
  csv_path: '/data/session1.csv',
  column_map: DEFAULT_COLUMN_MAP,
  velocity_quantity: 'wheel',
  created_at: '2026-01-01T10:00:00Z',
  analyzed: true,
}

export const SESSION_2: Session = {
  id: 'session-2',
  name: 'Morning Enduro Loop',
  bike_slug: 't7_test',
  csv_path: '/data/session2.csv',
  column_map: DEFAULT_COLUMN_MAP,
  velocity_quantity: 'wheel',
  created_at: '2026-01-02T08:00:00Z',
  analyzed: false,
}

// ── Analysis result ─────────────────────────────────────────────────────────
export const ANALYSIS_RESULT: AnalysisResult = {
  session_id: 'session-1',
  front_travel: {
    centers_pct: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95],
    time_pct: [2, 8, 25, 28, 18, 10, 5, 2, 1, 1],
    peak_center_pct: 35.0,
    pct_above_80: 4.0,
  },
  rear_travel: {
    centers_pct: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95],
    time_pct: [3, 7, 22, 30, 19, 11, 5, 2, 1, 0],
    peak_center_pct: 35.0,
    pct_above_80: 3.0,
  },
  front_velocity: {
    centers_mm_s: [-450, -300, -150, 0, 150, 300, 450],
    time_pct: [3, 12, 25, 20, 25, 12, 3],
    compression_area_pct: 40.0,
    rebound_area_pct: 60.0,
    ls_compression_pct: 18.0,
    hs_compression_pct: 22.0,
    ls_rebound_pct: 30.0,
    hs_rebound_pct: 30.0,
  },
  rear_velocity: {
    centers_mm_s: [-450, -300, -150, 0, 150, 300, 450],
    time_pct: [4, 11, 24, 22, 24, 11, 4],
    compression_area_pct: 39.0,
    rebound_area_pct: 61.0,
    ls_compression_pct: 17.0,
    hs_compression_pct: 22.0,
    ls_rebound_pct: 31.0,
    hs_rebound_pct: 30.0,
  },
  pitch: {
    time_s: [0, 1, 2, 3, 4, 5],
    pitch_deg: [0, -1, -3, -2, -1, 0],
    accel_x_g: [0, -0.1, -0.5, -0.3, -0.1, 0],
  },
  diagnostics: [
    {
      rule_id: 'deep_travel_front',
      severity: 'warning',
      title: 'Deep travel usage',
      message: 'Front spends 4% of time above 80% travel.',
      action: 'Consider increasing compression damping.',
    },
  ],
  duration_s: 30.0,
  sample_count: 7500,
}

// ── Calibration results ──────────────────────────────────────────────────────
export const FRONT_CAL_RESULT = { c_cal: 42.0, v0: 0.5, rmse: 0.08 }
export const REAR_CAL_RESULT = { a: -0.015, b: 4.2, c: 0.0, rmse: 0.4 }

// ── Calibration examples ─────────────────────────────────────────────────────
export const CAL_EXAMPLES = {
  front_strokes_mm: [0, 50, 100, 150, 200],
  front_voltages_v: [0.5, 1.6905, 2.881, 4.0714, 5.2619],
  rear_shock_strokes_mm: [0, 10, 20, 30, 40, 50],
  rear_wheel_travels_mm: [0, 40.5, 78, 112.5, 144, 172.5],
}

// ── Demo status ───────────────────────────────────────────────────────────────
export const DEMO_STATUS: DemoStatus = {
  session_count: 2,
  bike_count: 1,
  analyzed_count: 1,
  demo_session_id: 'session-1',
}
