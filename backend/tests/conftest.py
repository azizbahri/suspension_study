"""Shared fixtures for the suspension DAQ test suite."""

from __future__ import annotations

import pytest

from app.models.bike import BikeProfile
from tests.simulator.noise import NoiseConfig
from tests.simulator.physics import PhysicsModel
from tests.simulator.sensors import SensorModel


@pytest.fixture(scope="session")
def t7_bike() -> BikeProfile:
    """Planted T7 calibration constants — ground truth for all simulator tests."""
    return BikeProfile(
        name="Yamaha Ténéré 700 (Test Profile)",
        slug="t7_test",
        w_max_front_mm=210.0,
        w_max_rear_mm=210.0,
        fork_angle_deg=27.0,
        c_front=42.0,
        v0_front=0.50,
        c_rear=18.5,
        v0_rear=0.40,
        linkage_a=-0.015,
        linkage_b=4.20,
        linkage_c=0.0,
        adc_bits=12,
        v_ref=5.0,
        fs_hz=250.0,
        lpf_cutoff_disp_hz=20.0,
        lpf_cutoff_gyro_hz=10.0,
        complementary_alpha=0.98,
        stationary_samples=250,
        gyro_sensitivity=16.4,
        accel_sensitivity=2048.0,
        ls_threshold_mm_s=150.0,
    )


@pytest.fixture
def physics(t7_bike) -> PhysicsModel:
    return PhysicsModel(
        fs=t7_bike.fs_hz,
        duration_s=10.0,
        linkage_a=t7_bike.linkage_a,
        linkage_b=t7_bike.linkage_b,
        linkage_c=t7_bike.linkage_c,
    )


@pytest.fixture
def sensor(t7_bike) -> SensorModel:
    return SensorModel(t7_bike)


@pytest.fixture
def clean_noise() -> NoiseConfig:
    """Noise-free sensor model for calibration-recovery tests."""
    return NoiseConfig(
        front_adc_rms=0.0,
        rear_adc_rms=0.0,
        gyro_rms=0.0,
        accel_rms=0.0,
        gyro_bias=0.0,
        seed=0,
    )


@pytest.fixture
def realistic_noise() -> NoiseConfig:
    """Realistic noise for integration tests."""
    return NoiseConfig(
        front_adc_rms=1.5,
        rear_adc_rms=1.5,
        gyro_rms=0.5,
        accel_rms=0.01,
        gyro_bias=0.08,
        seed=42,
    )
