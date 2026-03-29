"""File-system storage for BikeProfile objects."""

from __future__ import annotations

from app.config import BIKES_DIR
from app.models.bike import BikeProfile

_T7_DEFAULT = BikeProfile(
    name="Yamaha Ténéré 700",
    slug="t7",
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


def seed_defaults() -> None:
    """Write the T7 profile if it does not already exist."""
    path = BIKES_DIR / "t7.json"
    if not path.exists():
        path.write_text(_T7_DEFAULT.model_dump_json(indent=2), encoding="utf-8")


def load_bikes() -> list[BikeProfile]:
    bikes = []
    for p in sorted(BIKES_DIR.glob("*.json")):
        try:
            bikes.append(BikeProfile.model_validate_json(p.read_text("utf-8")))
        except Exception:
            pass
    return bikes


def save_bike(bike: BikeProfile) -> None:
    path = BIKES_DIR / f"{bike.slug}.json"
    path.write_text(bike.model_dump_json(indent=2), encoding="utf-8")


def delete_bike(slug: str) -> bool:
    path = BIKES_DIR / f"{slug}.json"
    if path.exists():
        path.unlink()
        return True
    return False


def get_bike(slug: str) -> BikeProfile | None:
    path = BIKES_DIR / f"{slug}.json"
    if path.exists():
        return BikeProfile.model_validate_json(path.read_text("utf-8"))
    return None
