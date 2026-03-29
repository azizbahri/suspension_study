"""Re-exports from app.simulator.noise for test-suite backward compatibility."""
# ruff: noqa: F401
from app.simulator.noise import (
    NoiseConfig,
    add_gaussian_noise,
    add_supply_noise,
    add_gyro_bias_drift,
)
