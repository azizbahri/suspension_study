"""Named scenario builders combining PhysicsModel + noise configuration."""

from __future__ import annotations

from pathlib import Path

from app.models.bike import BikeProfile
from app.simulator.csv_writer import write_scenario_csv
from app.simulator.noise import NoiseConfig
from app.simulator.physics import PhysicsModel
from app.simulator.sensors import SensorModel


def static_sag_csv(
    bike: BikeProfile,
    output_path: Path,
    W_front_mm: float = 70.0,
    W_rear_mm: float = 95.0,
    noise: NoiseConfig | None = None,
    duration_s: float = 4.0,
) -> Path:
    """Scenario 1: stationary at sag."""
    model = PhysicsModel(fs=bike.fs_hz, duration_s=duration_s)
    state = model.static_sag(W_front_mm=W_front_mm, W_rear_mm=W_rear_mm)
    sensor = SensorModel(bike)
    if noise is None:
        noise = NoiseConfig(front_adc_rms=0.0, rear_adc_rms=0.0, gyro_rms=0.0, accel_rms=0.0)
    return write_scenario_csv(state, sensor, noise, output_path)


def braking_csv(
    bike: BikeProfile,
    output_path: Path,
    noise: NoiseConfig | None = None,
    duration_s: float = 10.0,
) -> Path:
    """Scenario 4: hard braking event."""
    model = PhysicsModel(fs=bike.fs_hz, duration_s=duration_s)
    state = model.braking_event()
    sensor = SensorModel(bike)
    if noise is None:
        noise = NoiseConfig()
    return write_scenario_csv(state, sensor, noise, output_path)


def square_edge_csv(
    bike: BikeProfile,
    output_path: Path,
    noise: NoiseConfig | None = None,
    duration_s: float = 5.0,
) -> Path:
    """Scenario 5: square-edge impact."""
    model = PhysicsModel(fs=bike.fs_hz, duration_s=duration_s)
    state = model.square_edge_hit()
    sensor = SensorModel(bike)
    if noise is None:
        noise = NoiseConfig()
    return write_scenario_csv(state, sensor, noise, output_path)


def repeated_bumps_csv(
    bike: BikeProfile,
    output_path: Path,
    noise: NoiseConfig | None = None,
    duration_s: float = 10.0,
) -> Path:
    """Scenario 6: repeated bumps with slow rebound (packing)."""
    model = PhysicsModel(fs=bike.fs_hz, duration_s=duration_s)
    state = model.repeated_bumps()
    sensor = SensorModel(bike)
    if noise is None:
        noise = NoiseConfig()
    return write_scenario_csv(state, sensor, noise, output_path)


def jump_and_landing_csv(
    bike: BikeProfile,
    output_path: Path,
    noise: NoiseConfig | None = None,
    duration_s: float = 10.0,
) -> Path:
    """Scenario 7: jump with airtime and landing shock."""
    model = PhysicsModel(fs=bike.fs_hz, duration_s=duration_s)
    state = model.jump_and_landing()
    sensor = SensorModel(bike)
    if noise is None:
        noise = NoiseConfig()
    return write_scenario_csv(state, sensor, noise, output_path)


def rough_terrain_csv(
    bike: BikeProfile,
    output_path: Path,
    noise: NoiseConfig | None = None,
    duration_s: float = 30.0,
) -> Path:
    """Scenario 12: rough terrain for end-to-end roundtrip."""
    model = PhysicsModel(fs=bike.fs_hz, duration_s=duration_s)
    state = model.rough_terrain(duration_s=duration_s)
    sensor = SensorModel(bike)
    if noise is None:
        noise = NoiseConfig()
    return write_scenario_csv(state, sensor, noise, output_path)
