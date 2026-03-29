from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.processing.calibration import fit_front_linear, fit_rear_linkage

router = APIRouter(prefix="/calibrate", tags=["calibrate"])


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
