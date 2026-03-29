from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ColumnMap(BaseModel):
    time_col: str | None = None
    front_raw_col: str = "front_raw"
    rear_raw_col: str = "rear_raw"
    gyro_y_col: str = "gyro_y_raw"
    accel_x_col: str = "accel_x_raw"
    accel_y_col: str = "accel_y_raw"
    accel_z_col: str = "accel_z_raw"
    invert_front: bool = False
    invert_rear: bool = False


class Session(BaseModel):
    id: str
    name: str
    bike_slug: str
    csv_path: str
    column_map: ColumnMap = Field(default_factory=ColumnMap)
    velocity_quantity: Literal["wheel", "shaft"] = "shaft"
    created_at: datetime
    analyzed: bool = False
