from pydantic import BaseModel, ConfigDict


class BikeProfile(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str
    slug: str
    w_max_front_mm: float = 210.0
    w_max_rear_mm: float = 210.0
    fork_angle_deg: float = 27.0
    c_front: float = 42.0
    v0_front: float = 0.50
    c_rear: float = 18.5
    v0_rear: float = 0.40
    linkage_a: float = -0.015
    linkage_b: float = 4.20
    linkage_c: float = 0.0
    adc_bits: int = 12
    v_ref: float = 5.0
    fs_hz: float = 250.0
    lpf_cutoff_disp_hz: float = 20.0
    lpf_cutoff_gyro_hz: float = 10.0
    complementary_alpha: float = 0.98
    stationary_samples: int = 250
    gyro_sensitivity: float = 16.4
    accel_sensitivity: float = 2048.0
    ls_threshold_mm_s: float = 150.0
