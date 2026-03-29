"""
Velocity estimation from filtered displacement.

Pipeline:
    W(t) → LPF (Butterworth, zero-phase) → W_f(t) → backward difference → v(t)

Sign convention: negative = compression, positive = rebound.
(W increases with compression → v = dW/dt → negate for the histogram convention)

Wheel velocity:
    v_wheel_n = (W_f_n - W_f_{n-1}) / dt

Shaft velocity — front:
    v_shaft_front = v_wheel_front / cos(theta)

Shaft velocity — rear (differentiate calibrated shock stroke directly):
    s_rear_f = LPF(s_rear)
    v_shaft_rear_n = (s_rear_f_n - s_rear_f_{n-1}) / dt
"""

from __future__ import annotations

import math

import numpy as np
from scipy.signal import butter, filtfilt


_MIN_FILTER_SAMPLES = 13  # padlen requirement for filtfilt with order-2 filter


def filter_displacement(
    signal_mm: np.ndarray,
    fs_hz: float,
    cutoff_hz: float = 20.0,
    order: int = 2,
) -> np.ndarray:
    """Zero-phase Butterworth low-pass filter. Returns input unchanged if too short."""
    if len(signal_mm) < _MIN_FILTER_SAMPLES:
        return signal_mm.astype(float)
    nyq = 0.5 * fs_hz
    b, a = butter(order, cutoff_hz / nyq, btype="low", analog=False)
    return filtfilt(b, a, signal_mm.astype(float))


def _backward_diff(signal: np.ndarray, dt: float) -> np.ndarray:
    """Backward difference derivative; first sample is set to 0."""
    v = np.empty_like(signal, dtype=float)
    v[0] = 0.0
    v[1:] = np.diff(signal) / dt
    return v


def wheel_velocity(
    filtered_mm: np.ndarray,
    fs_hz: float,
) -> np.ndarray:
    """
    Wheel velocity [mm/s] from filtered displacement.
    Sign: negative = compression (W increases downward → negate).
    """
    dt = 1.0 / fs_hz
    return -_backward_diff(filtered_mm, dt)


def shaft_velocity_front(
    v_wheel_mm_s: np.ndarray,
    fork_angle_deg: float,
) -> np.ndarray:
    """
    Shaft velocity for a direct-acting fork [mm/s].
    v_shaft = v_wheel / cos(theta)
    """
    theta = math.radians(fork_angle_deg)
    return v_wheel_mm_s / math.cos(theta)


def shaft_velocity_rear(
    shock_stroke_mm: np.ndarray,
    fs_hz: float,
    cutoff_hz: float = 20.0,
) -> np.ndarray:
    """
    Shaft velocity for the rear damper [mm/s].
    Differentiates calibrated shock stroke (not wheel travel) to bypass
    the non-constant linkage motion ratio.
    Sign: negative = compression.
    """
    filtered = filter_displacement(shock_stroke_mm, fs_hz, cutoff_hz)
    dt = 1.0 / fs_hz
    return -_backward_diff(filtered, dt)
