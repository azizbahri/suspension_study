"""
Demo data seeding.

On first startup (no sessions exist yet) this module:
1. Generates a 30-second rough-terrain DAQ CSV using the simulator.
2. Registers a "Demo — Rough Terrain (30 s)" session pointing at that CSV.

The CSV uses column names written by app.simulator.csv_writer:
    time_s, front_raw, rear_raw, gyro_y_raw, accel_x_raw, accel_y_raw, accel_z_raw
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.config import DEMOS_DIR
from app.models.session import ColumnMap, Session
from app.storage import sessions as session_store

DEMO_SESSION_NAME = "Demo — Rough Terrain (30 s)"
_DEMO_CSV_NAME = "demo_rough_terrain.csv"

# ColumnMap that matches the csv_writer output schema
_DEMO_COLUMN_MAP = ColumnMap(
    time_col="time_s",
    front_raw_col="front_raw",
    rear_raw_col="rear_raw",
    gyro_y_col="gyro_y_raw",
    accel_x_col="accel_x_raw",
    accel_y_col="accel_y_raw",
    accel_z_col="accel_z_raw",
    invert_front=False,
    invert_rear=False,
)


def seed_demo_data() -> None:
    """Generate a demo CSV and register a demo session if no sessions exist yet."""
    if session_store.list_sessions():
        return  # real data already present — do not overwrite

    DEMOS_DIR.mkdir(parents=True, exist_ok=True)
    demo_csv = DEMOS_DIR / _DEMO_CSV_NAME

    if not demo_csv.exists():
        _generate_demo_csv(demo_csv)

    session = Session(
        id=str(uuid.uuid4()),
        name=DEMO_SESSION_NAME,
        bike_slug="t7",
        csv_path=str(demo_csv),
        column_map=_DEMO_COLUMN_MAP,
        velocity_quantity="shaft",
        created_at=datetime.now(timezone.utc),
        analyzed=False,
    )
    session_store.save_session(session)


def _generate_demo_csv(output_path: Path) -> None:
    """Simulate a 30 s rough-terrain ride and write a DAQ-format CSV."""
    # Late imports keep startup fast when the demo CSV already exists.
    from app.models.bike import BikeProfile
    from app.simulator.csv_writer import write_scenario_csv
    from app.simulator.noise import NoiseConfig
    from app.simulator.physics import PhysicsModel
    from app.simulator.sensors import SensorModel

    # Use calibration constants that match the seeded T7 bike profile so that
    # the demo session can be analyzed immediately without re-calibrating.
    bike = BikeProfile(
        name="Demo",
        slug="demo",
        fork_angle_deg=27.0,
        c_front=42.0,
        v0_front=0.50,
        c_rear=18.5,
        v0_rear=0.40,
        linkage_a=-0.015,
        linkage_b=4.20,
        linkage_c=0.0,
        v_ref=5.0,
        adc_bits=12,
        fs_hz=250.0,
    )

    model = PhysicsModel(
        fs=250.0,
        duration_s=30.0,
        linkage_a=bike.linkage_a,
        linkage_b=bike.linkage_b,
        linkage_c=bike.linkage_c,
    )
    sensor = SensorModel(bike)
    noise = NoiseConfig(seed=42)
    state = model.rough_terrain(duration_s=30.0, seed=42)
    write_scenario_csv(state, sensor, noise, output_path)
