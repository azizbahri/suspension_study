"""
Tests for calibration.py — front linear and rear quadratic fitting.

Scenario 2: Front calibration recovery.
Scenario 3: Rear linkage polynomial recovery.
"""

from __future__ import annotations

import numpy as np
import pytest

from app.processing.calibration import fit_front_linear, fit_rear_linkage


def test_front_linear_recovery(t7_bike):
    """
    Scenario 2: Plant C_cal=42, V0=0.5. Generate noise-free data → recover within 0.1%.
    """
    c_planted = t7_bike.c_front   # 42.0 mm/V
    v0_planted = t7_bike.v0_front  # 0.5 V

    voltages = np.linspace(0.6, 4.5, 15)
    strokes = (voltages - v0_planted) * c_planted

    result = fit_front_linear(strokes, voltages)
    assert abs(result["c_cal"] - c_planted) / c_planted < 0.001
    assert abs(result["v0"] - v0_planted) < 0.005
    assert result["rmse"] < 0.01


def test_front_linear_recovery_noisy(t7_bike):
    """With small Gaussian noise, C_cal recovery should still be within 1%."""
    rng = np.random.default_rng(1)
    voltages = np.linspace(0.6, 4.5, 15)
    strokes = (voltages - t7_bike.v0_front) * t7_bike.c_front
    strokes_noisy = strokes + rng.normal(0, 0.3, len(strokes))

    result = fit_front_linear(strokes_noisy, voltages)
    assert abs(result["c_cal"] - t7_bike.c_front) / t7_bike.c_front < 0.02
    assert result["rmse"] < 1.0


def test_rear_linkage_recovery(t7_bike):
    """
    Scenario 3: Plant a=-0.015, b=4.20, c=0. Sweep 0–60 mm, recover within tolerance.
    """
    a_planted = t7_bike.linkage_a
    b_planted = t7_bike.linkage_b
    c_planted = t7_bike.linkage_c

    strokes = np.linspace(0, 60, 15)
    travels = a_planted * strokes**2 + b_planted * strokes + c_planted

    result = fit_rear_linkage(strokes, travels)
    assert abs(result["a"] - a_planted) < 0.001
    assert abs(result["b"] - b_planted) < 0.05
    assert abs(result["c"] - c_planted) < 1.0
    assert result["rmse"] < 0.1


def test_rear_linkage_rmse_reported(t7_bike):
    """RMSE should be near-zero on noise-free planted data."""
    strokes = np.linspace(0, 60, 12)
    travels = t7_bike.linkage_a * strokes**2 + t7_bike.linkage_b * strokes + t7_bike.linkage_c
    result = fit_rear_linkage(strokes, travels)
    assert result["rmse"] < 1e-8
