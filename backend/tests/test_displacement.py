"""
Tests for displacement.py — ADC→voltage, stroke, travel, travel%.

Scenario 1: Static sag roundtrip (planted constant → ADC → recover).
Scenario 2: Front calibration constants verified.
"""

from __future__ import annotations

import math

import numpy as np
import pytest

from app.models.bike import BikeProfile
from app.processing.displacement import (
    adc_to_voltage,
    front_stroke,
    front_travel,
    rear_stroke,
    rear_travel,
    travel_percent,
)


def test_adc_to_voltage_full_scale(t7_bike):
    """Full-scale ADC count should return V_ref."""
    counts = np.array([(1 << t7_bike.adc_bits) - 1])
    v = adc_to_voltage(counts, t7_bike.adc_bits, t7_bike.v_ref)
    assert abs(v[0] - t7_bike.v_ref) < 1e-6


def test_adc_to_voltage_zero(t7_bike):
    counts = np.array([0])
    v = adc_to_voltage(counts, t7_bike.adc_bits, t7_bike.v_ref)
    assert abs(v[0]) < 1e-6


def test_front_travel_formula(t7_bike):
    """Planted stroke → travel matches cos(theta) projection."""
    stroke_mm = np.array([100.0])
    theta = math.radians(t7_bike.fork_angle_deg)
    expected = 100.0 * math.cos(theta)
    result = front_travel(stroke_mm, t7_bike.fork_angle_deg)
    assert abs(result[0] - expected) < 1e-9


def test_travel_percent(t7_bike):
    """50 mm travel = 50/210 * 100 ≈ 23.8%"""
    w = np.array([50.0])
    p = travel_percent(w, t7_bike.w_max_front_mm)
    assert abs(p[0] - 100.0 * 50.0 / 210.0) < 1e-6


def test_static_sag_front_roundtrip(t7_bike, sensor, clean_noise):
    """
    Scenario 1: Front roundtrip.
    Plant W_front = 70 mm → ADC → voltage → stroke → travel → ≈ 70 mm (within 1 LSB).
    """
    W_true = 70.0
    adc = sensor.front_adc(np.array([W_true]))
    v = adc_to_voltage(adc.astype(float), t7_bike.adc_bits, t7_bike.v_ref)
    s = front_stroke(v, t7_bike.v0_front, t7_bike.c_front)
    W_rec = front_travel(s, t7_bike.fork_angle_deg)
    assert abs(W_rec[0] - W_true) < 0.6  # within 1 LSB worth of travel


def test_static_sag_rear_roundtrip(t7_bike, sensor):
    """
    Scenario 1: Rear roundtrip.
    Plant W_rear = 95 mm → ADC → stroke → linkage polynomial → ≈ 95 mm.
    """
    W_true = 95.0
    adc = sensor.rear_adc(np.array([W_true]))
    v = adc_to_voltage(adc.astype(float), t7_bike.adc_bits, t7_bike.v_ref)
    s = rear_stroke(v, t7_bike.v0_rear, t7_bike.c_rear)
    W_rec = rear_travel(s, t7_bike.linkage_a, t7_bike.linkage_b, t7_bike.linkage_c)
    assert abs(W_rec[0] - W_true) < 1.0
