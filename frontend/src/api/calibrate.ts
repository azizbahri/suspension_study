import { client } from './client';

export interface FrontCalibrationPayload {
  stroke_mm: number[];
  voltage_v: number[];
}

export interface FrontCalibrationResult {
  c_cal: number;
  v0: number;
  rmse: number;
}

export interface RearCalibrationPayload {
  shock_stroke_mm: number[];
  wheel_travel_mm: number[];
}

export interface RearCalibrationResult {
  a: number;
  b: number;
  c: number;
  rmse: number;
}

export const calibrateFront = async (payload: FrontCalibrationPayload): Promise<FrontCalibrationResult> => {
  const { data } = await client.post('/calibrate/front', payload);
  return data;
};

export const calibrateRear = async (payload: RearCalibrationPayload): Promise<RearCalibrationResult> => {
  const { data } = await client.post('/calibrate/rear', payload);
  return data;
};
