from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class TravelHistogram(BaseModel):
    centers_pct: list[float]
    time_pct: list[float]
    peak_center_pct: float
    pct_above_80: float


class VelocityHistogram(BaseModel):
    centers_mm_s: list[float]
    time_pct: list[float]
    compression_area_pct: float
    rebound_area_pct: float
    ls_compression_pct: float
    hs_compression_pct: float
    ls_rebound_pct: float
    hs_rebound_pct: float


class PitchTrace(BaseModel):
    time_s: list[float]
    pitch_deg: list[float]
    accel_x_g: list[float]


class DiagnosticNote(BaseModel):
    rule_id: str
    severity: Literal["info", "warning", "critical"]
    title: str
    message: str
    action: str


class AnalysisResult(BaseModel):
    session_id: str
    front_travel: TravelHistogram
    rear_travel: TravelHistogram
    front_velocity: VelocityHistogram
    rear_velocity: VelocityHistogram
    pitch: PitchTrace
    diagnostics: list[DiagnosticNote]
    duration_s: float
    sample_count: int
