"""
Tests for histograms.py — travel and velocity histogram construction.
"""

from __future__ import annotations

import numpy as np
import pytest

from app.processing.histograms import travel_histogram, velocity_histogram


def test_static_sag_histogram_peak(t7_bike):
    """
    Scenario 1: constant travel at 70 mm → 70/210 * 100 ≈ 33.3% → peak in 30–40% bin.
    """
    w_pct = np.full(1000, 70.0 / t7_bike.w_max_front_mm * 100.0)
    hist = travel_histogram(w_pct)
    assert 25.0 <= hist.peak_center_pct <= 45.0


def test_travel_histogram_bins():
    """Histogram bin percentages should sum to 100 (within floating-point)."""
    pct = np.random.default_rng(0).uniform(0, 100, 2000)
    hist = travel_histogram(pct)
    assert abs(sum(hist.time_pct) - 100.0) < 0.01


def test_pct_above_80_deep_travel():
    """All samples at 90% travel → pct_above_80 ≈ 100%."""
    pct = np.full(500, 90.0)
    hist = travel_histogram(pct)
    assert hist.pct_above_80 > 90.0


def test_velocity_histogram_symmetry():
    """Symmetric sinusoidal velocity → compression ≈ rebound area."""
    t = np.linspace(0, 10, 5000)
    v = 300.0 * np.sin(2 * np.pi * 2 * t)
    hist = velocity_histogram(v)
    assert abs(hist.compression_area_pct - hist.rebound_area_pct) < 5.0


def test_velocity_histogram_compression_asymmetry():
    """Compression-dominant signal → compression_area >> rebound_area."""
    # All negative: pure compression
    v = np.full(1000, -200.0)
    hist = velocity_histogram(v)
    assert hist.compression_area_pct > 95.0
    assert hist.rebound_area_pct < 5.0


def test_velocity_histogram_ls_hs_split():
    """Signal with both LS (<150 mm/s) and HS (>150 mm/s) components."""
    rng = np.random.default_rng(42)
    v = np.concatenate([
        rng.uniform(-100, 0, 500),   # LS compression
        rng.uniform(-500, -150, 500),  # HS compression
    ])
    hist = velocity_histogram(v, ls_threshold=150.0)
    assert hist.ls_compression_pct > 0
    assert hist.hs_compression_pct > 0
    assert hist.ls_rebound_pct == 0.0
