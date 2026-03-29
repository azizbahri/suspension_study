export interface TravelHistogram {
  centers_pct: number[];
  time_pct: number[];
  peak_center_pct: number;
  pct_above_80: number;
}

export interface VelocityHistogram {
  centers_mm_s: number[];
  time_pct: number[];
  compression_area_pct: number;
  rebound_area_pct: number;
  ls_compression_pct: number;
  hs_compression_pct: number;
  ls_rebound_pct: number;
  hs_rebound_pct: number;
}

export interface PitchTrace {
  time_s: number[];
  pitch_deg: number[];
  accel_x_g: number[];
}

export interface DiagnosticNote {
  rule_id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  action: string;
}

export interface AnalysisResult {
  session_id: string;
  front_travel: TravelHistogram;
  rear_travel: TravelHistogram;
  front_velocity: VelocityHistogram;
  rear_velocity: VelocityHistogram;
  pitch: PitchTrace;
  diagnostics: DiagnosticNote[];
  duration_s: number;
  sample_count: number;
}
