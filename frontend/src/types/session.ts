export interface ColumnMap {
  time_col: string | null;
  front_raw_col: string;
  rear_raw_col: string;
  gyro_y_col: string;
  accel_x_col: string;
  accel_y_col: string;
  accel_z_col: string;
  invert_front: boolean;
  invert_rear: boolean;
}

export interface Session {
  id: string;
  name: string;
  bike_slug: string;
  csv_path: string;
  column_map: ColumnMap;
  velocity_quantity: 'wheel' | 'shaft';
  created_at: string;
  analyzed: boolean;
}
