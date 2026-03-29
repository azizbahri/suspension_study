"""
Histogram construction for travel and velocity data.

Travel histogram:
    X: 0–100% in 10% bins (bin centers: 5, 15, ..., 95)
    Y: % of ride time in each bin

Velocity histogram:
    X: −1500 to +1500 mm/s in 50 mm/s bins
    Y: % of ride time in each bin
    Positive = rebound, Negative = compression
    LS threshold: |v| < 150 mm/s
"""

from __future__ import annotations

import numpy as np

from app.models.analysis import TravelHistogram, VelocityHistogram

_TRAVEL_BIN_EDGES = np.arange(0.0, 101.0, 10.0)
_VEL_BIN_EDGES = np.arange(-1500.0, 1550.0, 50.0)


def travel_histogram(
    travel_pct: np.ndarray,
    ls_threshold: float = 80.0,
) -> TravelHistogram:
    """Build a time-percentage travel histogram."""
    valid = travel_pct[~np.isnan(travel_pct)]
    counts, edges = np.histogram(valid, bins=_TRAVEL_BIN_EDGES)
    total = counts.sum() if counts.sum() > 0 else 1
    time_pct = 100.0 * counts / total
    centers = 0.5 * (edges[:-1] + edges[1:])

    peak_idx = int(np.argmax(counts))
    peak_center = float(centers[peak_idx])
    pct_above_80 = float(time_pct[centers >= 80.0].sum())

    return TravelHistogram(
        centers_pct=centers.tolist(),
        time_pct=time_pct.tolist(),
        peak_center_pct=peak_center,
        pct_above_80=pct_above_80,
    )


def velocity_histogram(
    velocity_mm_s: np.ndarray,
    ls_threshold: float = 150.0,
) -> VelocityHistogram:
    """Build a time-percentage velocity histogram with LS/HS breakdown."""
    valid = velocity_mm_s[~np.isnan(velocity_mm_s)]
    counts, edges = np.histogram(valid, bins=_VEL_BIN_EDGES)
    total = counts.sum() if counts.sum() > 0 else 1
    time_pct = 100.0 * counts / total
    centers = 0.5 * (edges[:-1] + edges[1:])

    comp_mask = centers < 0.0
    reb_mask = centers > 0.0
    compression_area_pct = float(time_pct[comp_mask].sum())
    rebound_area_pct = float(time_pct[reb_mask].sum())

    ls_comp_mask = comp_mask & (np.abs(centers) <= ls_threshold)
    hs_comp_mask = comp_mask & (np.abs(centers) > ls_threshold)
    ls_reb_mask = reb_mask & (centers <= ls_threshold)
    hs_reb_mask = reb_mask & (centers > ls_threshold)

    return VelocityHistogram(
        centers_mm_s=centers.tolist(),
        time_pct=time_pct.tolist(),
        compression_area_pct=compression_area_pct,
        rebound_area_pct=rebound_area_pct,
        ls_compression_pct=float(time_pct[ls_comp_mask].sum()),
        hs_compression_pct=float(time_pct[hs_comp_mask].sum()),
        ls_rebound_pct=float(time_pct[ls_reb_mask].sum()),
        hs_rebound_pct=float(time_pct[hs_reb_mask].sum()),
    )
