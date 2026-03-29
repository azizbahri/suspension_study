"""
Calibration fitting routines.

Front linear calibration:
    s_f = C_cal * V_raw + intercept → C_cal = m, V0 = -intercept/m
    Fit: s = m*V + b via np.polyfit

Rear linkage polynomial:
    W = a*s^2 + b*s + c
    Fit: np.polyfit(s, W, deg=2) → [a, b, c]
"""

from __future__ import annotations

import numpy as np


def fit_front_linear(
    strokes_mm: list[float] | np.ndarray,
    voltages_v: list[float] | np.ndarray,
) -> dict[str, float]:
    """
    Least-squares linear fit: s = C_cal*(V - V0).
    Returns {c_cal, v0, rmse}.
    """
    s = np.asarray(strokes_mm, dtype=float)
    v = np.asarray(voltages_v, dtype=float)
    coeffs = np.polyfit(v, s, 1)  # s = m*V + b
    m, b = float(coeffs[0]), float(coeffs[1])
    c_cal = m
    v0 = -b / m if m != 0.0 else 0.0
    predicted = m * v + b
    rmse = float(np.sqrt(np.mean((s - predicted) ** 2)))
    return {"c_cal": c_cal, "v0": v0, "rmse": rmse}


def fit_rear_linkage(
    shock_strokes_mm: list[float] | np.ndarray,
    wheel_travels_mm: list[float] | np.ndarray,
) -> dict[str, float]:
    """
    Least-squares quadratic fit: W = a*s^2 + b*s + c.
    Returns {a, b, c, rmse}.
    """
    s = np.asarray(shock_strokes_mm, dtype=float)
    w = np.asarray(wheel_travels_mm, dtype=float)
    coeffs = np.polyfit(s, w, 2)  # [a, b, c]
    a, b, c = float(coeffs[0]), float(coeffs[1]), float(coeffs[2])
    predicted = a * s**2 + b * s + c
    rmse = float(np.sqrt(np.mean((w - predicted) ** 2)))
    return {"a": a, "b": b, "c": c, "rmse": rmse}
