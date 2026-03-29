"""
Chassis pitch angle estimation using a complementary filter (always — never gyro-only).

Signal chain:
    gyro_raw  → physical deg/s  → bias-correct  → LPF  ──┐
    accel_raw → g units → atan2 pitch estimate  ──────────┤ complementary filter → phi
                                                           └─ alpha * gyro_int + (1-alpha) * phi_acc

Complementary filter (trapezoidal integration):
    phi_acc_n = atan2(-ax_n, sqrt(ay_n^2 + az_n^2))          [degrees, from gravity vector]
    phi_n = alpha*(phi_{n-1} + 0.5*(omega_f_n + omega_f_{n-1})*dt) + (1-alpha)*phi_acc_n
"""

from __future__ import annotations

import math

import numpy as np
from scipy.signal import butter, filtfilt


_MIN_FILTER_SAMPLES = 13
_G = 9.80665  # m/s^2


def _butter_lpf(signal: np.ndarray, fs_hz: float, cutoff_hz: float, order: int = 2) -> np.ndarray:
    if len(signal) < _MIN_FILTER_SAMPLES:
        return signal.astype(float)
    nyq = 0.5 * fs_hz
    b, a = butter(order, cutoff_hz / nyq, btype="low", analog=False)
    return filtfilt(b, a, signal.astype(float))


def gyro_to_deg_s(
    gyro_raw: np.ndarray,
    sensitivity: float = 16.4,
) -> np.ndarray:
    """Convert raw gyro counts to deg/s using MPU-6050-style sensitivity [counts/(deg/s)]."""
    return gyro_raw.astype(float) / sensitivity


def remove_bias(
    rate_deg_s: np.ndarray,
    stationary_samples: int = 250,
) -> tuple[np.ndarray, float]:
    """Estimate and subtract zero-rate bias from first stationary_samples samples."""
    n = min(stationary_samples, len(rate_deg_s))
    bias = float(np.mean(rate_deg_s[:n]))
    return rate_deg_s - bias, bias


def filter_gyro(
    rate_deg_s: np.ndarray,
    fs_hz: float,
    cutoff_hz: float = 10.0,
) -> np.ndarray:
    """Low-pass filter the pitch-rate signal."""
    return _butter_lpf(rate_deg_s, fs_hz, cutoff_hz)


def accel_pitch_deg(
    ax_g: np.ndarray,
    ay_g: np.ndarray,
    az_g: np.ndarray,
) -> np.ndarray:
    """
    Gravity-derived pitch angle [degrees].
    phi_acc = atan2(-ax, sqrt(ay^2 + az^2))
    """
    return np.degrees(np.arctan2(-ax_g, np.sqrt(ay_g**2 + az_g**2)))


def complementary_filter_pitch(
    omega_y_f: np.ndarray,
    phi_acc: np.ndarray,
    fs_hz: float,
    alpha: float = 0.98,
    initial_deg: float = 0.0,
) -> np.ndarray:
    """
    Trapezoidal complementary filter.
    phi_n = alpha*(phi_{n-1} + 0.5*(omega_f_n + omega_f_{n-1})*dt) + (1-alpha)*phi_acc_n
    """
    dt = 1.0 / fs_hz
    n = len(omega_y_f)
    phi = np.empty(n, dtype=float)
    phi[0] = initial_deg
    for i in range(1, n):
        gyro_increment = 0.5 * (omega_y_f[i] + omega_y_f[i - 1]) * dt
        phi[i] = alpha * (phi[i - 1] + gyro_increment) + (1.0 - alpha) * phi_acc[i]
    return phi


def longitudinal_accel_g(
    ax_raw: np.ndarray,
    accel_sensitivity: float = 2048.0,
) -> np.ndarray:
    """Convert raw accelerometer counts to g-units for the longitudinal axis."""
    return ax_raw.astype(float) / accel_sensitivity
