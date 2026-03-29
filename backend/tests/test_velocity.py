"""
Tests for velocity.py — filtering, backward difference, shaft vs wheel velocity.
"""

from __future__ import annotations

import math

import numpy as np
import pytest

from app.processing.velocity import (
    filter_displacement,
    shaft_velocity_front,
    shaft_velocity_rear,
    wheel_velocity,
)


def test_wheel_velocity_zero_for_constant(t7_bike):
    """Constant displacement → zero velocity (except first sample)."""
    w = np.full(500, 70.0)
    v = wheel_velocity(filter_displacement(w, t7_bike.fs_hz), t7_bike.fs_hz)
    assert np.allclose(v[1:], 0.0, atol=1e-6)


def test_wheel_velocity_sign_convention(t7_bike):
    """
    Scenario: fork compresses (W increases) → velocity is negative (compression).
    """
    n = 500
    # Linearly increasing travel = compression
    w = np.linspace(50.0, 100.0, n)
    v = wheel_velocity(filter_displacement(w, t7_bike.fs_hz), t7_bike.fs_hz)
    # Most samples should be negative (compression)
    assert np.sum(v[5:-5] < 0) > n * 0.8


def test_filter_displacement_short_signal(t7_bike):
    """Short signal shorter than filter pad length → returned unchanged."""
    w = np.array([1.0, 2.0, 3.0])
    result = filter_displacement(w, t7_bike.fs_hz)
    assert len(result) == len(w)


def test_filter_displacement_reduces_high_freq(t7_bike):
    """20 Hz LPF should attenuate 100 Hz noise significantly."""
    t = np.arange(1000) / t7_bike.fs_hz
    signal = 70.0 + 5.0 * np.sin(2 * np.pi * 100 * t)  # 100 Hz noise
    filtered = filter_displacement(signal, t7_bike.fs_hz, cutoff_hz=20.0)
    # Amplitude of 100 Hz should be greatly reduced
    noise_rms = float(np.std(filtered - 70.0))
    assert noise_rms < 0.5  # effectively eliminated


def test_shaft_vs_wheel_velocity_front(t7_bike):
    """Shaft velocity = wheel velocity / cos(theta) for front fork."""
    w = np.sin(2 * np.pi * 2 * np.arange(1000) / t7_bike.fs_hz) * 20.0 + 70.0
    w_f = filter_displacement(w, t7_bike.fs_hz)
    v_wheel = wheel_velocity(w_f, t7_bike.fs_hz)
    v_shaft = shaft_velocity_front(v_wheel, t7_bike.fork_angle_deg)
    theta = math.radians(t7_bike.fork_angle_deg)
    ratio = v_shaft[10:-10] / (v_wheel[10:-10] + 1e-12)
    expected_ratio = 1.0 / math.cos(theta)
    assert np.allclose(ratio, expected_ratio, rtol=0.01)


def test_square_edge_compression_velocity(t7_bike, physics):
    """
    Scenario 5: Square-edge hit should produce |v| >> 150 mm/s at impact.
    """
    from tests.simulator.sensors import SensorModel
    from app.processing.displacement import adc_to_voltage, front_stroke, front_travel

    state = physics.square_edge_hit(peak_compression_mm=60.0, impact_duration_s=0.012)
    sensor = SensorModel(t7_bike)
    adc = sensor.front_adc(state.W_front_true)
    v_raw = adc_to_voltage(adc.astype(float), t7_bike.adc_bits, t7_bike.v_ref)
    s = front_stroke(v_raw, t7_bike.v0_front, t7_bike.c_front)
    w = front_travel(s, t7_bike.fork_angle_deg)
    w_f = filter_displacement(w, t7_bike.fs_hz)
    v = wheel_velocity(w_f, t7_bike.fs_hz)
    # Peak compression velocity should be substantial
    assert np.max(np.abs(v)) > 150.0
