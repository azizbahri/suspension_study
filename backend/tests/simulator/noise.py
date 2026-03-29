"""
Noise and quantization models for hardware simulation.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np


@dataclass
class NoiseConfig:
    front_adc_rms: float = 1.5    # LSB
    rear_adc_rms: float = 1.5     # LSB
    gyro_rms: float = 0.05        # counts (deg/s * sensitivity)
    accel_rms: float = 0.01       # fraction of g
    gyro_bias: float = 0.08       # deg/s constant offset
    seed: int = 42


def add_gaussian_noise(
    signal: np.ndarray,
    rms: float,
    rng: np.random.Generator,
) -> np.ndarray:
    """Add zero-mean Gaussian noise."""
    if rms == 0.0:
        return signal.astype(float)
    return signal.astype(float) + rng.normal(0.0, rms, size=signal.shape)


def add_supply_noise(
    signal: np.ndarray,
    amplitude: float,
    freq_hz: float,
    fs: float,
) -> np.ndarray:
    """Sinusoidal supply-frequency interference."""
    t = np.arange(len(signal)) / fs
    return signal.astype(float) + amplitude * np.sin(2.0 * np.pi * freq_hz * t)


def add_gyro_bias_drift(
    gyro_raw: np.ndarray,
    initial_bias: float,
    drift_rate_dps_per_s: float,
    fs: float,
    sensitivity: float = 16.4,
) -> np.ndarray:
    """Linear gyro bias drift over time (in raw counts)."""
    t = np.arange(len(gyro_raw)) / fs
    drift_counts = (initial_bias + drift_rate_dps_per_s * t) * sensitivity
    return gyro_raw.astype(float) + drift_counts
