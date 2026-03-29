"""
Full session processing pipeline.

process_session(df, bike, column_map, velocity_quantity) → AnalysisResult

Steps:
1. Extract raw ADC columns from DataFrame using column_map
2. ADC counts → voltage
3. Front: voltage → stroke → wheel travel
   Rear:  voltage → shock stroke → wheel travel (linkage polynomial)
4. Filter displacement (Butterworth 20 Hz LPF)
5. Compute velocities (wheel or shaft, per velocity_quantity setting)
6. Compute pitch via complementary filter
7. Build histograms
8. Run diagnostic advisor
9. Return AnalysisResult
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from app.advisor.rules import run_advisor
from app.models.analysis import AnalysisResult, PitchTrace
from app.models.bike import BikeProfile
from app.models.session import ColumnMap
from app.processing import displacement as disp
from app.processing import histograms as hist
from app.processing import pitch as pit
from app.processing import velocity as vel


def _col(df: pd.DataFrame, name: str | None, default: float = 0.0) -> np.ndarray:
    """Extract a column safely; return array of defaults if column is missing."""
    if name and name in df.columns:
        return df[name].to_numpy(dtype=float)
    return np.full(len(df), default, dtype=float)


def process_session(
    df: pd.DataFrame,
    bike: BikeProfile,
    column_map: ColumnMap,
    velocity_quantity: str = "shaft",
) -> AnalysisResult:
    n = len(df)
    dt = 1.0 / bike.fs_hz

    # --- time axis ---
    if column_map.time_col and column_map.time_col in df.columns:
        t = df[column_map.time_col].to_numpy(dtype=float)
        t = t - t[0]
    else:
        t = np.arange(n) * dt

    # --- raw ADC channels ---
    front_raw = _col(df, column_map.front_raw_col)
    rear_raw = _col(df, column_map.rear_raw_col)
    gyro_y_raw = _col(df, column_map.gyro_y_col)
    accel_x_raw = _col(df, column_map.accel_x_col)
    accel_y_raw = _col(df, column_map.accel_y_col)
    accel_z_raw = _col(df, column_map.accel_z_col, default=bike.accel_sensitivity)  # rest ≈ 1g

    if column_map.invert_front:
        front_raw = -front_raw
    if column_map.invert_rear:
        rear_raw = -rear_raw

    # --- displacement ---
    v_front = disp.adc_to_voltage(front_raw, bike.adc_bits, bike.v_ref)
    v_rear = disp.adc_to_voltage(rear_raw, bike.adc_bits, bike.v_ref)

    s_front = disp.front_stroke(v_front, bike.v0_front, bike.c_front)
    w_front = disp.front_travel(s_front, bike.fork_angle_deg)

    s_rear = disp.rear_stroke(v_rear, bike.v0_rear, bike.c_rear)
    w_rear = disp.rear_travel(s_rear, bike.linkage_a, bike.linkage_b, bike.linkage_c)

    # --- filter displacement ---
    w_front_f = vel.filter_displacement(w_front, bike.fs_hz, bike.lpf_cutoff_disp_hz)
    w_rear_f = vel.filter_displacement(w_rear, bike.fs_hz, bike.lpf_cutoff_disp_hz)

    # --- velocity ---
    if velocity_quantity == "wheel":
        v_front_hist = vel.wheel_velocity(w_front_f, bike.fs_hz)
        v_rear_hist = vel.wheel_velocity(w_rear_f, bike.fs_hz)
    else:  # shaft
        v_front_wheel = vel.wheel_velocity(w_front_f, bike.fs_hz)
        v_front_hist = vel.shaft_velocity_front(v_front_wheel, bike.fork_angle_deg)
        v_rear_hist = vel.shaft_velocity_rear(s_rear, bike.fs_hz, bike.lpf_cutoff_disp_hz)

    # --- travel percent ---
    p_front = disp.travel_percent(w_front_f, bike.w_max_front_mm)
    p_rear = disp.travel_percent(w_rear_f, bike.w_max_rear_mm)

    # --- pitch (complementary filter) ---
    omega_raw = pit.gyro_to_deg_s(gyro_y_raw, bike.gyro_sensitivity)
    omega_corrected, _ = pit.remove_bias(omega_raw, bike.stationary_samples)
    omega_f = pit.filter_gyro(omega_corrected, bike.fs_hz, bike.lpf_cutoff_gyro_hz)

    ax_g = accel_x_raw / bike.accel_sensitivity
    ay_g = accel_y_raw / bike.accel_sensitivity
    az_g = accel_z_raw / bike.accel_sensitivity

    phi_acc = pit.accel_pitch_deg(ax_g, ay_g, az_g)
    phi = pit.complementary_filter_pitch(omega_f, phi_acc, bike.fs_hz, bike.complementary_alpha)

    accel_g = pit.longitudinal_accel_g(accel_x_raw, bike.accel_sensitivity)

    # --- histograms ---
    front_travel_hist = hist.travel_histogram(p_front, ls_threshold=80.0)
    rear_travel_hist = hist.travel_histogram(p_rear, ls_threshold=80.0)
    front_vel_hist = hist.velocity_histogram(v_front_hist, bike.ls_threshold_mm_s)
    rear_vel_hist = hist.velocity_histogram(v_rear_hist, bike.ls_threshold_mm_s)

    pitch_trace = PitchTrace(
        time_s=t.tolist(),
        pitch_deg=phi.tolist(),
        accel_x_g=accel_g.tolist(),
    )

    result = AnalysisResult(
        session_id="",  # filled in by caller
        front_travel=front_travel_hist,
        rear_travel=rear_travel_hist,
        front_velocity=front_vel_hist,
        rear_velocity=rear_vel_hist,
        pitch=pitch_trace,
        diagnostics=[],
        duration_s=float(t[-1]) if len(t) > 0 else 0.0,
        sample_count=n,
    )

    result.diagnostics = run_advisor(result, bike)
    return result
