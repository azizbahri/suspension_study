"""
Hardware simulation: forward model of physical motorcycle states.

Each scenario method returns a StateDict with true physical states at fs_hz.
These are used by SensorModel to generate synthetic ADC counts.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np


@dataclass
class StateDict:
    t: np.ndarray             # time [s]
    W_front_true: np.ndarray  # front wheel travel [mm]
    W_rear_true: np.ndarray   # rear wheel travel [mm]
    s_rear_true: np.ndarray   # rear shock stroke [mm] (inverse of linkage polynomial)
    phi_true: np.ndarray      # chassis pitch [deg]
    omega_y_true: np.ndarray  # pitch rate [deg/s]
    accel_x_true: np.ndarray  # longitudinal accel [m/s^2]
    accel_y_true: np.ndarray  # lateral accel [m/s^2]  (≈0 for straight-line)
    accel_z_true: np.ndarray  # vertical accel [m/s^2] (≈9.81 at rest)


def _invert_linkage(W_mm: np.ndarray, a: float, b: float, c: float) -> np.ndarray:
    """
    Invert W = a*s^2 + b*s + c for s (positive root of the quadratic).
    For a < 0, b > 0 and W ≥ 0 there is always one physical root.
    """
    # a*s^2 + b*s + (c - W) = 0
    discriminant = b**2 - 4.0 * a * (c - W_mm)
    discriminant = np.maximum(discriminant, 0.0)  # numerical guard
    # take the positive root
    return (-b + np.sqrt(discriminant)) / (2.0 * a)


class PhysicsModel:
    """Forward-model: scenario description → true physical state arrays."""

    def __init__(
        self,
        fs: float = 250.0,
        duration_s: float = 10.0,
        linkage_a: float = -0.015,
        linkage_b: float = 4.20,
        linkage_c: float = 0.0,
        g: float = 9.80665,
    ):
        self.fs = fs
        self.dt = 1.0 / fs
        self.duration_s = duration_s
        self.t = np.arange(0, duration_s, self.dt)
        self.a = linkage_a
        self.b = linkage_b
        self.c = linkage_c
        self.g = g

    def _zeros(self) -> tuple[np.ndarray, ...]:
        n = len(self.t)
        z = np.zeros(n)
        return z.copy(), z.copy(), z.copy(), z.copy(), z.copy(), z.copy()

    def static_sag(
        self,
        W_front_mm: float = 70.0,
        W_rear_mm: float = 95.0,
    ) -> StateDict:
        """Bike stationary at sag. Pitch=0, accel=(0,0,g)."""
        n = len(self.t)
        W_f = np.full(n, W_front_mm)
        W_r = np.full(n, W_rear_mm)
        s_r = _invert_linkage(W_r, self.a, self.b, self.c)
        phi = np.zeros(n)
        omega = np.zeros(n)
        ax = np.zeros(n)
        ay = np.zeros(n)
        az = np.full(n, self.g)
        return StateDict(
            t=self.t.copy(),
            W_front_true=W_f,
            W_rear_true=W_r,
            s_rear_true=s_r,
            phi_true=phi,
            omega_y_true=omega,
            accel_x_true=ax,
            accel_y_true=ay,
            accel_z_true=az,
        )

    def braking_event(
        self,
        peak_decel_g: float = 0.8,
        duration_s: float = 2.0,
        fork_compression_mm: float = 40.0,
    ) -> StateDict:
        """Hard braking: sinusoidal deceleration, fork compresses, pitch nose-down."""
        n = len(self.t)
        t = self.t

        # sinusoidal decel pulse centered at 1/4 of total duration
        t_center = min(duration_s * 0.5, self.duration_s * 0.3)
        t_sigma = duration_s * 0.3
        decel_profile = peak_decel_g * np.exp(-0.5 * ((t - t_center) / t_sigma) ** 2)
        ax = -decel_profile * self.g  # negative = braking (forward)

        # Fork compresses proportionally to decel
        W_f = 70.0 + fork_compression_mm * (decel_profile / peak_decel_g)

        # Rear extends slightly during braking (nose-down = rear lifts)
        W_r = 95.0 - 10.0 * (decel_profile / peak_decel_g)
        W_r = np.maximum(W_r, 5.0)
        s_r = _invert_linkage(W_r, self.a, self.b, self.c)

        # Pitch: integrate decel → nose-down (negative)
        omega = -peak_decel_g * 40.0 * np.exp(-0.5 * ((t - t_center) / t_sigma) ** 2)
        phi = np.zeros(n)
        for i in range(1, n):
            phi[i] = phi[i - 1] + 0.5 * (omega[i] + omega[i - 1]) * self.dt

        ay = np.zeros(n)
        az = np.full(n, self.g)

        return StateDict(
            t=t.copy(),
            W_front_true=W_f,
            W_rear_true=W_r,
            s_rear_true=s_r,
            phi_true=phi,
            omega_y_true=omega,
            accel_x_true=ax,
            accel_y_true=ay,
            accel_z_true=az,
        )

    def square_edge_hit(
        self,
        impact_duration_s: float = 0.012,
        peak_compression_mm: float = 60.0,
        rebound_time_constant_s: float = 0.25,
    ) -> StateDict:
        """Sharp square-edge: fast compression, exponential rebound."""
        n = len(self.t)
        t = self.t
        t_impact = self.duration_s * 0.2

        W_f = np.zeros(n)
        for i, ti in enumerate(t):
            if ti < t_impact:
                W_f[i] = 70.0
            elif ti < t_impact + impact_duration_s:
                frac = (ti - t_impact) / impact_duration_s
                W_f[i] = 70.0 + peak_compression_mm * frac
            else:
                W_f[i] = 70.0 + peak_compression_mm * math.exp(
                    -(ti - t_impact - impact_duration_s) / rebound_time_constant_s
                )

        W_r = np.full(n, 95.0)
        s_r = _invert_linkage(W_r, self.a, self.b, self.c)
        phi = np.zeros(n)
        omega = np.zeros(n)
        ax = np.zeros(n)
        ay = np.zeros(n)
        az = np.full(n, self.g)

        return StateDict(
            t=t.copy(),
            W_front_true=W_f,
            W_rear_true=W_r,
            s_rear_true=s_r,
            phi_true=phi,
            omega_y_true=omega,
            accel_x_true=ax,
            accel_y_true=ay,
            accel_z_true=az,
        )

    def repeated_bumps(
        self,
        n_bumps: int = 8,
        bump_spacing_s: float = 0.8,
        peak_mm: float = 50.0,
        rebound_damping_factor: float = 0.85,
    ) -> StateDict:
        """Successive bumps with slow rebound → cumulative packing."""
        n = len(self.t)
        W_f = np.full(n, 70.0)
        W_r = np.full(n, 95.0)

        # Each bump: quick compression (40 ms), slow return
        comp_dur = 0.040
        reb_tau = bump_spacing_s * rebound_damping_factor

        for k in range(n_bumps):
            t_hit = 0.5 + k * bump_spacing_s
            for i, ti in enumerate(self.t):
                if ti < t_hit:
                    continue
                dt_since = ti - t_hit
                if dt_since < comp_dur:
                    extra = peak_mm * dt_since / comp_dur
                else:
                    extra = peak_mm * math.exp(-(dt_since - comp_dur) / reb_tau)
                W_f[i] += extra
                W_r[i] += extra * 0.5

        W_f = np.minimum(W_f, 200.0)
        W_r = np.minimum(W_r, 200.0)
        s_r = _invert_linkage(W_r, self.a, self.b, self.c)
        phi = np.zeros(n)
        omega = np.zeros(n)
        ax = np.zeros(n)
        ay = np.zeros(n)
        az = np.full(n, self.g)

        return StateDict(
            t=self.t.copy(),
            W_front_true=W_f,
            W_rear_true=W_r,
            s_rear_true=s_r,
            phi_true=phi,
            omega_y_true=omega,
            accel_x_true=ax,
            accel_y_true=ay,
            accel_z_true=az,
        )

    def jump_and_landing(
        self,
        airtime_s: float = 1.2,
        landing_compression_mm: float = 120.0,
    ) -> StateDict:
        """Both wheels extend mid-air (low accel_z), landing shock on front."""
        n = len(self.t)
        t = self.t
        t_launch = 1.0
        t_land = t_launch + airtime_s
        land_dur = 0.020

        W_f = np.zeros(n)
        az = np.zeros(n)

        for i, ti in enumerate(t):
            if ti < t_launch:
                W_f[i] = 70.0
                az[i] = self.g
            elif ti < t_land:
                # airborne: partial extension
                W_f[i] = 15.0
                az[i] = 0.05 * self.g
            elif ti < t_land + land_dur:
                frac = (ti - t_land) / land_dur
                W_f[i] = 15.0 + landing_compression_mm * frac
                az[i] = self.g + 8.0 * self.g * frac
            else:
                decay = math.exp(-(ti - t_land - land_dur) / 0.3)
                W_f[i] = 15.0 + landing_compression_mm * decay
                az[i] = self.g

        W_r = np.full(n, 95.0)
        s_r = _invert_linkage(W_r, self.a, self.b, self.c)
        phi = np.zeros(n)
        omega = np.zeros(n)
        ax = np.zeros(n)
        ay = np.zeros(n)

        return StateDict(
            t=t.copy(),
            W_front_true=W_f,
            W_rear_true=W_r,
            s_rear_true=s_r,
            phi_true=phi,
            omega_y_true=omega,
            accel_x_true=ax,
            accel_y_true=ay,
            accel_z_true=az,
        )

    def rough_terrain(
        self,
        duration_s: float = 30.0,
        rms_front_mm: float = 25.0,
        rms_rear_mm: float = 20.0,
        seed: int = 42,
    ) -> StateDict:
        """Band-limited Gaussian random travel for stochastic rough-terrain simulation."""
        from scipy.signal import butter, filtfilt

        n = int(duration_s * self.fs)
        t = np.arange(n) * self.dt
        rng = np.random.default_rng(seed)

        def band_limited(rms, fc=15.0):
            noise = rng.standard_normal(n)
            nyq = 0.5 * self.fs
            b, f_ = butter(2, fc / nyq, btype="low")
            filtered = filtfilt(b, f_, noise)
            filtered *= rms / (filtered.std() + 1e-12)
            return filtered

        W_f = 70.0 + band_limited(rms_front_mm)
        W_r = 95.0 + band_limited(rms_rear_mm)
        W_f = np.clip(W_f, 0.0, 200.0)
        W_r = np.clip(W_r, 0.0, 200.0)
        s_r = _invert_linkage(W_r, self.a, self.b, self.c)

        phi = np.zeros(n)
        omega = np.zeros(n)
        ax = np.zeros(n)
        ay = np.zeros(n)
        az = np.full(n, self.g)

        return StateDict(
            t=t,
            W_front_true=W_f,
            W_rear_true=W_r,
            s_rear_true=s_r,
            phi_true=phi,
            omega_y_true=omega,
            accel_x_true=ax,
            accel_y_true=ay,
            accel_z_true=az,
        )
