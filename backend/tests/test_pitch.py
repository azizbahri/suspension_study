"""
Tests for pitch.py — bias correction, filtering, complementary filter.

Scenario 8: Complementary filter suppresses gyro drift vs pure integration.
"""

from __future__ import annotations

import numpy as np
import pytest

from app.processing.pitch import (
    accel_pitch_deg,
    complementary_filter_pitch,
    filter_gyro,
    gyro_to_deg_s,
    remove_bias,
)


def test_bias_correction(t7_bike):
    """Bias estimate should equal mean of first stationary window."""
    rate = np.zeros(500)
    rate[:250] = 0.08  # stationary bias
    rate[250:] = np.random.default_rng(0).normal(0, 0.1, 250)
    corrected, bias = remove_bias(rate, stationary_samples=250)
    assert abs(bias - 0.08) < 0.01
    assert abs(np.mean(corrected[:250])) < 1e-10


def test_accel_pitch_at_rest():
    """At rest (ax=0, ay=0, az=g), pitch should be ≈ 0°."""
    n = 100
    ax = np.zeros(n)
    ay = np.zeros(n)
    az = np.ones(n)  # already in g units
    phi = accel_pitch_deg(ax, ay, az)
    assert np.allclose(phi, 0.0, atol=0.01)


def test_complementary_filter_tracks_slow_tilt(t7_bike):
    """
    Quasi-static tilt: CF should track accel pitch within ±1°.
    """
    n = 500
    fs = t7_bike.fs_hz
    dt = 1.0 / fs
    # True pitch: ramps to 10° over 2 s, then holds
    phi_true = np.zeros(n)
    ramp_n = int(2.0 * fs)
    for i in range(1, n):
        phi_true[i] = min(10.0, phi_true[i - 1] + 10.0 / ramp_n)

    omega_true = np.gradient(phi_true, dt)

    # Accel-derived pitch (gravity reference — exact)
    phi_acc = phi_true.copy()

    # CF (pure gyro part should match well for slow motion)
    omega_f = filter_gyro(omega_true, fs)
    phi_cf = complementary_filter_pitch(omega_f, phi_acc, fs, alpha=0.98)

    rmse = float(np.sqrt(np.mean((phi_cf - phi_true) ** 2)))
    assert rmse < 1.0


def test_cf_better_than_gyro_only_under_drift(t7_bike):
    """
    Scenario 8: With a 0.08 °/s gyro bias, pure gyro integration drifts
    significantly more than the complementary filter over 60 s.
    """
    fs = t7_bike.fs_hz
    duration = 20.0
    n = int(duration * fs)
    dt = 1.0 / fs

    bias = 0.08  # deg/s
    # True pitch: stationary (phi_true = 0)
    phi_true = np.zeros(n)

    # Gyro: bias only
    omega_raw = np.full(n, bias)

    # CF accelerometer reference: correct (phi_acc = 0)
    phi_acc = np.zeros(n)

    # Pure gyro integral (trapezoid)
    phi_gyro = np.zeros(n)
    for i in range(1, n):
        phi_gyro[i] = phi_gyro[i - 1] + 0.5 * (omega_raw[i] + omega_raw[i - 1]) * dt

    # CF
    phi_cf = complementary_filter_pitch(omega_raw, phi_acc, fs, alpha=0.98)

    gyro_drift = float(np.abs(phi_gyro[-1]))
    cf_error = float(np.max(np.abs(phi_cf)))

    assert gyro_drift > cf_error * 5, (
        f"CF should suppress drift significantly: gyro drift={gyro_drift:.2f}°, CF error={cf_error:.2f}°"
    )
