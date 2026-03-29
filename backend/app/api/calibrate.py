from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.processing.calibration import fit_front_linear, fit_rear_linkage

router = APIRouter(prefix="/calibrate", tags=["calibrate"])

# ---------------------------------------------------------------------------
# Example calibration data (T7 Ténéré 700 profile)
# Front:  V = s / 42.0 + 0.50  → five-point static sweep
# Rear:   W = -0.015·s² + 4.20·s  → six-point linkage sweep
# ---------------------------------------------------------------------------
_FRONT_STROKES: list[float] = [0.0, 50.0, 100.0, 150.0, 200.0]
_FRONT_VOLTAGES: list[float] = [round(s / 42.0 + 0.50, 4) for s in _FRONT_STROKES]
_REAR_STROKES: list[float] = [0.0, 10.0, 20.0, 30.0, 40.0, 50.0]
_REAR_TRAVELS: list[float] = [
    round(-0.015 * s**2 + 4.20 * s, 2) for s in _REAR_STROKES
]


class CalibrationExamples(BaseModel):
    front_strokes_mm: list[float]
    front_voltages_v: list[float]
    rear_shock_strokes_mm: list[float]
    rear_wheel_travels_mm: list[float]


@router.get("/examples", response_model=CalibrationExamples)
def calibration_examples():
    """Return example calibration data points matching the T7 bike profile."""
    return CalibrationExamples(
        front_strokes_mm=_FRONT_STROKES,
        front_voltages_v=_FRONT_VOLTAGES,
        rear_shock_strokes_mm=_REAR_STROKES,
        rear_wheel_travels_mm=_REAR_TRAVELS,
    )


class FrontCalRequest(BaseModel):
    strokes_mm: list[float]
    voltages_v: list[float]


class RearCalRequest(BaseModel):
    shock_strokes_mm: list[float]
    wheel_travels_mm: list[float]


@router.post("/front")
def calibrate_front(req: FrontCalRequest):
    if len(req.strokes_mm) < 2 or len(req.voltages_v) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 calibration points")
    if len(req.strokes_mm) != len(req.voltages_v):
        raise HTTPException(status_code=400, detail="strokes_mm and voltages_v must have same length")
    return fit_front_linear(req.strokes_mm, req.voltages_v)


@router.post("/rear")
def calibrate_rear(req: RearCalRequest):
    if len(req.shock_strokes_mm) < 3 or len(req.wheel_travels_mm) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 calibration points for quadratic fit")
    if len(req.shock_strokes_mm) != len(req.wheel_travels_mm):
        raise HTTPException(status_code=400, detail="shock_strokes_mm and wheel_travels_mm must have same length")
    return fit_rear_linkage(req.shock_strokes_mm, req.wheel_travels_mm)
