"""
Pipeline integration tests.

Scenario 12: End-to-end roundtrip — simulator CSV → process → AnalysisResult.
Scenario 13: Column mapping edge cases.
"""

from __future__ import annotations

import pandas as pd
import numpy as np
import pytest

from app.models.session import ColumnMap
from app.processing.pipeline import process_session
from tests.simulator.csv_writer import write_scenario_csv
from tests.simulator.noise import NoiseConfig
from tests.simulator.physics import PhysicsModel
from tests.simulator.sensors import SensorModel
from tests.simulator.scenarios import rough_terrain_csv, static_sag_csv


def test_end_to_end_roundtrip(t7_bike, tmp_path, realistic_noise):
    """
    Scenario 12: rough terrain CSV → process_session → physically valid AnalysisResult.
    """
    csv_path = rough_terrain_csv(t7_bike, tmp_path / "rough.csv", noise=realistic_noise, duration_s=10.0)
    df = pd.read_csv(csv_path)

    col_map = ColumnMap()
    result = process_session(df, t7_bike, col_map, velocity_quantity="shaft")

    # No NaNs in histogram outputs
    assert all(not np.isnan(x) for x in result.front_travel.time_pct)
    assert all(not np.isnan(x) for x in result.front_velocity.time_pct)

    # Histogram time percentages sum to ≈100
    assert abs(sum(result.front_travel.time_pct) - 100.0) < 0.01
    assert abs(sum(result.rear_travel.time_pct) - 100.0) < 0.01

    # Velocity compression + rebound + zero should cover all samples
    total_vel = result.front_velocity.compression_area_pct + result.front_velocity.rebound_area_pct
    assert total_vel <= 100.01

    # Pitch trace length matches sample count
    assert len(result.pitch.pitch_deg) == result.sample_count
    assert len(result.pitch.time_s) == result.sample_count

    # Duration is physically reasonable
    assert result.duration_s > 5.0


def test_column_mapping_edge_case_no_time(t7_bike, tmp_path, clean_noise):
    """
    Scenario 13: CSV without a time column → timestamps generated from fs_hz.
    """
    csv_path = static_sag_csv(t7_bike, tmp_path / "sag.csv", noise=clean_noise, duration_s=2.0)
    df = pd.read_csv(csv_path)
    df = df.drop(columns=["time_s"])  # remove time column

    col_map = ColumnMap(time_col=None)  # explicitly no time
    result = process_session(df, t7_bike, col_map)

    expected_n = len(df)
    assert result.sample_count == expected_n
    assert result.duration_s == pytest.approx((expected_n - 1) / t7_bike.fs_hz, abs=0.01)


def test_missing_accel_columns_graceful(t7_bike, tmp_path, clean_noise):
    """
    Scenario 13: Missing accel_y and accel_z → pipeline completes without error.
    Pitch trace should still be produced (accel-pitch defaults to 0 for missing axes).
    """
    csv_path = static_sag_csv(t7_bike, tmp_path / "sag2.csv", noise=clean_noise, duration_s=2.0)
    df = pd.read_csv(csv_path)
    df = df.drop(columns=["accel_y_raw", "accel_z_raw"])

    col_map = ColumnMap()
    result = process_session(df, t7_bike, col_map)
    assert len(result.pitch.pitch_deg) == len(df)
