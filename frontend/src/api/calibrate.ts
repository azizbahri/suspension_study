import { client } from './client';

export interface FrontCalibrationPayload {
  strokes_mm: number[];
  voltages_v: number[];
}

export interface FrontCalibrationResult {
  c_cal: number;
  v0: number;
  rmse: number;
}

export interface RearCalibrationPayload {
  shock_strokes_mm: number[];
  wheel_travels_mm: number[];
}

export interface RearCalibrationResult {
  a: number;
  b: number;
  c: number;
  rmse: number;
}

export interface CalibrationExamples {
  front_strokes_mm: number[];
  front_voltages_v: number[];
  rear_shock_strokes_mm: number[];
  rear_wheel_travels_mm: number[];
}

export const calibrateFront = async (payload: FrontCalibrationPayload): Promise<FrontCalibrationResult> => {
  const { data } = await client.post('/calibrate/front', payload);
  return data;
};

export const calibrateRear = async (payload: RearCalibrationPayload): Promise<RearCalibrationResult> => {
  const { data } = await client.post('/calibrate/rear', payload);
  return data;
};

export const getCalibrationExamples = async (): Promise<CalibrationExamples> => {
  const { data } = await client.get('/calibrate/examples');
  return data;
};

