"""
Sensor model: converts true physical states into raw ADC counts.

Inverts the calibration chain:
    Front: W_front → s_f = W/cos(θ) → V = s_f/C_front + V0 → ADC
    Rear:  W_rear  → s_rear (quadratic inverse) → V = s_rear/C_rear + V0 → ADC
    Gyro:  omega_y → counts = (omega_y + bias) * sensitivity
    Accel: a_g     → counts = a_g * sensitivity
"""

from __future__ import annotations

import math

import numpy as np

from app.models.bike import BikeProfile
from app.simulator.physics import _invert_linkage


class SensorModel:
    def __init__(self, bike: BikeProfile):
        self.bike = bike
        self._max_adc = (1 << bike.adc_bits) - 1

    def _quantize_adc(self, voltage: np.ndarray) -> np.ndarray:
        """Voltage → 12-bit ADC counts (clipped to valid range)."""
        counts = np.round(voltage / self.bike.v_ref * self._max_adc)
        return np.clip(counts, 0, self._max_adc).astype(int)

    def front_adc(self, W_front_mm: np.ndarray) -> np.ndarray:
        """
        Invert: s_f = W / cos(θ), then V = s_f / C_front + V0_front.
        """
        theta = math.radians(self.bike.fork_angle_deg)
        s_f = W_front_mm / math.cos(theta)
        voltage = s_f / self.bike.c_front + self.bike.v0_front
        return self._quantize_adc(voltage)

    def rear_adc(self, W_rear_mm: np.ndarray) -> np.ndarray:
        """
        Invert linkage polynomial for shock stroke, then V = s / C_rear + V0_rear.
        """
        s = _invert_linkage(W_rear_mm, self.bike.linkage_a, self.bike.linkage_b, self.bike.linkage_c)
        voltage = s / self.bike.c_rear + self.bike.v0_rear
        return self._quantize_adc(voltage)

    def gyro_y_raw(
        self,
        omega_y_deg_s: np.ndarray,
        bias_deg_s: float = 0.08,
    ) -> np.ndarray:
        """
        (omega_y + bias) * sensitivity → signed int16 counts.
        """
        counts = (omega_y_deg_s + bias_deg_s) * self.bike.gyro_sensitivity
        return np.round(counts).astype(int)

    def accel_raw(
        self,
        ax_m_s2: np.ndarray,
        ay_m_s2: np.ndarray,
        az_m_s2: np.ndarray,
        g: float = 9.80665,
    ) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Each axis: round(a / g * sensitivity) → signed int16 counts.
        """
        sens = self.bike.accel_sensitivity
        ax_raw = np.round(ax_m_s2 / g * sens).astype(int)
        ay_raw = np.round(ay_m_s2 / g * sens).astype(int)
        az_raw = np.round(az_m_s2 / g * sens).astype(int)
        return ax_raw, ay_raw, az_raw
