"""
Displacement translation from raw ADC counts to wheel travel.

Front (direct-acting telescopic fork):
    V_raw = (adc / (2^N - 1)) * V_ref
    s_f   = (V_raw - V0_front) * C_front        [mm]
    W_front = s_f * cos(theta)                   [mm, theta = fork angle from vertical]

Rear (progressive linkage):
    V_raw  = (adc / (2^N - 1)) * V_ref
    s_rear = (V_raw - V0_rear) * C_rear          [mm, shock stroke]
    W_rear = a*s_rear^2 + b*s_rear + c           [mm, wheel travel via linkage polynomial]

Travel percentage:
    P = 100 * W / W_max
"""

from __future__ import annotations

import math

import numpy as np


def adc_to_voltage(
    adc_counts: np.ndarray,
    adc_bits: int = 12,
    v_ref: float = 5.0,
) -> np.ndarray:
    """Convert integer ADC counts to voltage [V]."""
    full_scale = (1 << adc_bits) - 1
    return adc_counts.astype(float) / full_scale * v_ref


def front_stroke(
    voltage: np.ndarray,
    v0_front: float,
    c_front: float,
) -> np.ndarray:
    """Convert front sensor voltage to sensor stroke [mm]."""
    return (voltage - v0_front) * c_front


def front_travel(
    stroke_mm: np.ndarray,
    fork_angle_deg: float,
) -> np.ndarray:
    """Project fork-axis stroke to vertical wheel travel [mm]."""
    theta = math.radians(fork_angle_deg)
    return stroke_mm * math.cos(theta)


def rear_stroke(
    voltage: np.ndarray,
    v0_rear: float,
    c_rear: float,
) -> np.ndarray:
    """Convert rear sensor voltage to shock stroke [mm]."""
    return (voltage - v0_rear) * c_rear


def rear_travel(
    shock_stroke_mm: np.ndarray,
    a: float,
    b: float,
    c: float,
) -> np.ndarray:
    """Apply linkage polynomial: W = a*s^2 + b*s + c → wheel travel [mm]."""
    s = shock_stroke_mm
    return a * s**2 + b * s + c


def travel_percent(
    wheel_travel_mm: np.ndarray,
    w_max_mm: float,
) -> np.ndarray:
    """Normalize wheel travel to 0–100% of total available stroke."""
    return 100.0 * wheel_travel_mm / w_max_mm
