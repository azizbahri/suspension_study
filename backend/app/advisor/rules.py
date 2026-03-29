"""
Diagnostic rule engine.

Each rule takes (AnalysisResult, BikeProfile) and returns a DiagnosticNote or None.
run_advisor collects all non-None results.

Rules implement the tuning guidance from the project documentation:
  - overview.md section 4
  - spring_rate_preload_report.md
  - compression_damping_report.md
  - rebound_damping_report.md
"""

from __future__ import annotations

import numpy as np

from app.models.analysis import AnalysisResult, DiagnosticNote
from app.models.bike import BikeProfile


def _deep_travel_tail(result: AnalysisResult, bike: BikeProfile) -> DiagnosticNote | None:
    """Spring rate / preload: too much time above 80% travel."""
    for hist in (result.front_travel, result.rear_travel):
        if hist.pct_above_80 > 10.0:
            return DiagnosticNote(
                rule_id="deep_travel_tail",
                severity="warning",
                title="Excessive deep-stroke usage",
                message=(
                    f"{hist.pct_above_80:.1f}% of ride time spent above 80% travel. "
                    "The spring may be too soft or the bike is under-preloaded."
                ),
                action=(
                    "If the histogram center is correct (~30–40%), fit a stiffer spring. "
                    "If the whole distribution is shifted right, increase preload first."
                ),
            )
    return None


def _travel_center_shifted_right(result: AnalysisResult, bike: BikeProfile) -> DiagnosticNote | None:
    """Ride height too low — preload likely insufficient."""
    for hist in (result.front_travel, result.rear_travel):
        if hist.peak_center_pct > 50.0:
            return DiagnosticNote(
                rule_id="travel_center_shifted_right",
                severity="warning",
                title="Ride height too low",
                message=(
                    f"Histogram peak at {hist.peak_center_pct:.0f}% travel "
                    "(target: 30–40%). The suspension is operating too deep in the stroke."
                ),
                action="Increase preload to raise the static equilibrium point.",
            )
    return None


def _travel_center_shifted_left(result: AnalysisResult, bike: BikeProfile) -> DiagnosticNote | None:
    """Ride height too high — over-preloaded or spring too stiff."""
    for hist in (result.front_travel, result.rear_travel):
        if hist.peak_center_pct < 20.0:
            return DiagnosticNote(
                rule_id="travel_center_shifted_left",
                severity="info",
                title="Ride height too high",
                message=(
                    f"Histogram peak at {hist.peak_center_pct:.0f}% travel. "
                    "The bike is not using enough of the available stroke."
                ),
                action=(
                    "Reduce preload. If the problem persists, the spring may be too stiff."
                ),
            )
    return None


def _harsh_hs_compression(result: AnalysisResult, bike: BikeProfile) -> DiagnosticNote | None:
    """High-speed compression dominates → hydraulic harshness."""
    for label, hist in (("Front", result.front_velocity), ("Rear", result.rear_velocity)):
        if hist.hs_compression_pct > 20.0:
            return DiagnosticNote(
                rule_id="harsh_hs_compression",
                severity="critical",
                title=f"{label}: harsh high-speed compression",
                message=(
                    f"{hist.hs_compression_pct:.1f}% of ride time in high-speed compression "
                    f"(>{ bike.ls_threshold_mm_s:.0f} mm/s). "
                    "The damper may be hydraulically locking on sharp impacts."
                ),
                action=(
                    "Reduce (open) high-speed compression damping. "
                    "If no external adjuster is available, consider lighter oil or shim re-valve."
                ),
            )
    return None


def _brake_dive(result: AnalysisResult, bike: BikeProfile) -> DiagnosticNote | None:
    """Excessive pitch during braking while velocity stays in LS range."""
    pitch = np.array(result.pitch.pitch_deg)
    accel = np.array(result.pitch.accel_x_g)
    braking_mask = accel < -0.5

    if not braking_mask.any():
        return None

    max_nose_down = float(np.min(pitch[braking_mask]))
    if max_nose_down > -15.0:
        return None

    # Check front velocity during braking events — must be LS-dominated
    front_v = np.array(result.front_velocity.centers_mm_s)
    front_t = np.array(result.front_velocity.time_pct)
    hs_comp = float(front_t[front_v < -bike.ls_threshold_mm_s].sum())
    ls_comp = float(front_t[(front_v < 0) & (front_v >= -bike.ls_threshold_mm_s)].sum())

    if ls_comp > hs_comp:
        return DiagnosticNote(
            rule_id="brake_dive",
            severity="warning",
            title="Excessive brake dive",
            message=(
                f"Pitch reached {max_nose_down:.1f}° during braking "
                f"(threshold: −15°). Fork velocity is primarily in the low-speed zone, "
                "indicating load-transfer compression rather than terrain impact."
            ),
            action=(
                "Increase low-speed compression damping by 2–3 clicks to slow weight transfer."
            ),
        )
    return None


def _compression_asymmetry(result: AnalysisResult, bike: BikeProfile) -> DiagnosticNote | None:
    """Compression area >> rebound area → packing (too much rebound damping)."""
    for label, hist in (("Front", result.front_velocity), ("Rear", result.rear_velocity)):
        if hist.rebound_area_pct > 0 and hist.compression_area_pct > hist.rebound_area_pct * 1.5:
            ratio = hist.compression_area_pct / max(hist.rebound_area_pct, 0.1)
            return DiagnosticNote(
                rule_id="compression_asymmetry",
                severity="warning",
                title=f"{label}: suspension packing (slow rebound)",
                message=(
                    f"Compression occupancy ({hist.compression_area_pct:.1f}%) is "
                    f"{ratio:.1f}× the rebound occupancy ({hist.rebound_area_pct:.1f}%). "
                    "The suspension may not be recovering between bumps."
                ),
                action=(
                    "Reduce (open) rebound damping. The spring needs less restriction "
                    "to return the wheel to the ground."
                ),
            )
    return None


def _rebound_kickback(result: AnalysisResult, bike: BikeProfile) -> DiagnosticNote | None:
    """Rebound area >> compression area → pogo (too little rebound damping)."""
    for label, hist in (("Front", result.front_velocity), ("Rear", result.rear_velocity)):
        if hist.compression_area_pct > 0 and hist.rebound_area_pct > hist.compression_area_pct * 1.5:
            return DiagnosticNote(
                rule_id="rebound_kickback",
                severity="warning",
                title=f"{label}: rebound kickback / pogo",
                message=(
                    f"Rebound occupancy ({hist.rebound_area_pct:.1f}%) is significantly "
                    f"larger than compression ({hist.compression_area_pct:.1f}%). "
                    "The suspension may be returning energy too violently after bumps."
                ),
                action=(
                    "Increase (close) rebound damping to control spring extension."
                ),
            )
    return None


_RULES = [
    _deep_travel_tail,
    _travel_center_shifted_right,
    _travel_center_shifted_left,
    _harsh_hs_compression,
    _brake_dive,
    _compression_asymmetry,
    _rebound_kickback,
]


def run_advisor(result: AnalysisResult, bike: BikeProfile) -> list[DiagnosticNote]:
    notes = []
    for rule in _RULES:
        try:
            note = rule(result, bike)
            if note is not None:
                notes.append(note)
        except Exception:
            pass
    return notes
