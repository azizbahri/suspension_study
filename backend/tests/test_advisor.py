"""
Tests for advisor rules.

Verifies that diagnostic rules fire / don't fire on controlled simulator inputs.
"""

from __future__ import annotations

import numpy as np
import pytest

from app.advisor.rules import run_advisor
from app.models.analysis import (
    AnalysisResult,
    DiagnosticNote,
    PitchTrace,
    TravelHistogram,
    VelocityHistogram,
)


def _make_travel_hist(peak_pct: float, pct_above_80: float) -> TravelHistogram:
    centers = list(range(5, 100, 10))
    time_pct = [0.0] * len(centers)
    peak_idx = int(round((peak_pct - 5) / 10))
    peak_idx = max(0, min(peak_idx, len(centers) - 1))
    time_pct[peak_idx] = 100.0 - pct_above_80
    above_80_idx = [i for i, c in enumerate(centers) if c >= 80.0]
    if above_80_idx and pct_above_80 > 0:
        time_pct[above_80_idx[0]] = pct_above_80
    return TravelHistogram(
        centers_pct=[float(c) for c in centers],
        time_pct=[float(t) for t in time_pct],
        peak_center_pct=float(peak_pct),
        pct_above_80=float(pct_above_80),
    )


def _make_vel_hist(
    comp_pct: float,
    reb_pct: float,
    ls_comp: float = 0.0,
    hs_comp: float = 0.0,
    ls_threshold: float = 150.0,
) -> VelocityHistogram:
    """
    Build a VelocityHistogram with time_pct bins populated to match the requested
    ls_comp and hs_comp percentages so that the advisor rule (which reads raw bins)
    sees the expected distribution.
    """
    centers = np.arange(-1475, 1500, 50, dtype=float)
    time_pct = np.zeros(len(centers))

    ls_comp_bins = np.where((centers < 0) & (centers >= -ls_threshold))[0]
    hs_comp_bins = np.where(centers < -ls_threshold)[0]
    reb_bins = np.where(centers > 0)[0]

    if ls_comp > 0 and len(ls_comp_bins) > 0:
        time_pct[ls_comp_bins] = ls_comp / len(ls_comp_bins)
    if hs_comp > 0 and len(hs_comp_bins) > 0:
        time_pct[hs_comp_bins] = hs_comp / len(hs_comp_bins)
    if reb_pct > 0 and len(reb_bins) > 0:
        time_pct[reb_bins] = reb_pct / len(reb_bins)

    return VelocityHistogram(
        centers_mm_s=centers.tolist(),
        time_pct=time_pct.tolist(),
        compression_area_pct=float(comp_pct),
        rebound_area_pct=float(reb_pct),
        ls_compression_pct=float(ls_comp),
        hs_compression_pct=float(hs_comp),
        ls_rebound_pct=0.0,
        hs_rebound_pct=0.0,
    )


def _make_result(
    front_travel_peak: float = 35.0,
    front_pct_above_80: float = 1.0,
    rear_travel_peak: float = 35.0,
    rear_pct_above_80: float = 1.0,
    comp_pct: float = 50.0,
    reb_pct: float = 50.0,
    hs_comp_pct: float = 5.0,
    pitch_deg: list[float] | None = None,
    accel_g: list[float] | None = None,
) -> AnalysisResult:
    if pitch_deg is None:
        pitch_deg = [0.0] * 500
    if accel_g is None:
        accel_g = [0.0] * 500
    t = list(np.arange(len(pitch_deg)) / 250.0)

    return AnalysisResult(
        session_id="test",
        front_travel=_make_travel_hist(front_travel_peak, front_pct_above_80),
        rear_travel=_make_travel_hist(rear_travel_peak, rear_pct_above_80),
        front_velocity=_make_vel_hist(comp_pct, reb_pct, hs_comp=hs_comp_pct),
        rear_velocity=_make_vel_hist(comp_pct, reb_pct),
        pitch=PitchTrace(time_s=t, pitch_deg=pitch_deg, accel_x_g=accel_g),
        diagnostics=[],
        duration_s=float(len(pitch_deg)) / 250.0,
        sample_count=len(pitch_deg),
    )


def test_deep_travel_tail_fires(t7_bike):
    """Rule fires when pct_above_80 > 10%."""
    result = _make_result(front_pct_above_80=15.0)
    notes = run_advisor(result, t7_bike)
    rule_ids = [n.rule_id for n in notes]
    assert "deep_travel_tail" in rule_ids


def test_deep_travel_tail_silent(t7_bike):
    """Rule silent when pct_above_80 ≤ 10%."""
    result = _make_result(front_pct_above_80=8.0, rear_pct_above_80=8.0)
    notes = run_advisor(result, t7_bike)
    rule_ids = [n.rule_id for n in notes]
    assert "deep_travel_tail" not in rule_ids


def test_brake_dive_fires(t7_bike):
    """Rule fires when pitch < -15° during braking (accel < -0.5g) and LS-dominated."""
    n = 500
    pitch_deg = [-20.0] * n
    accel_g = [-0.8] * n
    result = _make_result(pitch_deg=pitch_deg, accel_g=accel_g, comp_pct=40.0, reb_pct=40.0)
    # Override front velocity to be LS-dominated (ls_comp > hs_comp in raw bins)
    result.front_velocity = _make_vel_hist(40.0, 40.0, ls_comp=35.0, hs_comp=5.0)
    notes = run_advisor(result, t7_bike)
    rule_ids = [n.rule_id for n in notes]
    assert "brake_dive" in rule_ids


def test_compression_asymmetry_fires(t7_bike):
    """Rule fires when comp >> reb (packing)."""
    result = _make_result(comp_pct=75.0, reb_pct=25.0)
    notes = run_advisor(result, t7_bike)
    rule_ids = [n.rule_id for n in notes]
    assert "compression_asymmetry" in rule_ids


def test_rebound_kickback_fires(t7_bike):
    """Rule fires when reb >> comp (pogo)."""
    result = _make_result(comp_pct=25.0, reb_pct=75.0)
    notes = run_advisor(result, t7_bike)
    rule_ids = [n.rule_id for n in notes]
    assert "rebound_kickback" in rule_ids


def test_no_false_positives_balanced(t7_bike):
    """Balanced, well-centered session → no critical rules fire."""
    result = _make_result(
        front_travel_peak=35.0,
        front_pct_above_80=3.0,
        rear_travel_peak=35.0,
        rear_pct_above_80=3.0,
        comp_pct=48.0,
        reb_pct=48.0,
        hs_comp_pct=8.0,
    )
    notes = run_advisor(result, t7_bike)
    critical = [n for n in notes if n.severity == "critical"]
    assert len(critical) == 0
