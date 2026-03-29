"""
CSV writer: converts a simulated StateDict + sensor model → CSV file matching DAQ schema.

Output columns: time_s, front_raw, rear_raw, gyro_y_raw, accel_x_raw, accel_y_raw, accel_z_raw
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from app.simulator.noise import NoiseConfig, add_gaussian_noise
from app.simulator.physics import StateDict
from app.simulator.sensors import SensorModel


def write_scenario_csv(
    state: StateDict,
    sensor: SensorModel,
    noise: NoiseConfig,
    output_path: Path,
) -> Path:
    """
    Full pipeline: StateDict → sensor quantization → noise → CSV.
    Returns the output path.
    """
    rng = np.random.default_rng(noise.seed)

    front_raw = sensor.front_adc(state.W_front_true).astype(float)
    rear_raw = sensor.rear_adc(state.W_rear_true).astype(float)
    gyro_y = sensor.gyro_y_raw(state.omega_y_true, bias_deg_s=noise.gyro_bias).astype(float)
    ax_raw, ay_raw, az_raw = sensor.accel_raw(
        state.accel_x_true, state.accel_y_true, state.accel_z_true
    )

    front_raw = np.round(add_gaussian_noise(front_raw, noise.front_adc_rms, rng)).astype(int)
    rear_raw = np.round(add_gaussian_noise(rear_raw, noise.rear_adc_rms, rng)).astype(int)
    gyro_y = np.round(add_gaussian_noise(gyro_y, noise.gyro_rms, rng)).astype(int)

    df = pd.DataFrame(
        {
            "time_s": state.t,
            "front_raw": front_raw,
            "rear_raw": rear_raw,
            "gyro_y_raw": gyro_y,
            "accel_x_raw": ax_raw,
            "accel_y_raw": ay_raw,
            "accel_z_raw": az_raw,
        }
    )
    output_path = Path(output_path)
    df.to_csv(output_path, index=False)
    return output_path
