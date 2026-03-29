export interface BikeProfile {
  name: string;
  slug: string;
  w_max_front_mm: number;
  w_max_rear_mm: number;
  fork_angle_deg: number;
  c_front: number;
  v0_front: number;
  c_rear: number;
  v0_rear: number;
  linkage_a: number;
  linkage_b: number;
  linkage_c: number;
  adc_bits: number;
  v_ref: number;
  fs_hz: number;
  lpf_cutoff_disp_hz: number;
  lpf_cutoff_gyro_hz: number;
  complementary_alpha: number;
  stationary_samples: number;
  gyro_sensitivity: number;
  accel_sensitivity: number;
  ls_threshold_mm_s: number;
}
