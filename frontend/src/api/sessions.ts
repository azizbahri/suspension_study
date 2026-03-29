import { client } from './client';
import type { Session, ColumnMap } from '../types/session';

export interface ImportPayload {
  csv_path: string;
  name: string;
  bike_slug: string;
  velocity_quantity: 'wheel' | 'shaft';
  column_map: ColumnMap;
}

export interface UploadPayload {
  file: File;
  name: string;
  bike_slug: string;
  velocity_quantity: 'wheel' | 'shaft';
  column_map: ColumnMap;
}

export const getSessions = async (): Promise<Session[]> => {
  const { data } = await client.get('/sessions');
  return data;
};

export const importSession = async (payload: ImportPayload): Promise<Session> => {
  const { data } = await client.post('/sessions/import', payload);
  return data;
};

export const uploadSession = async (payload: UploadPayload): Promise<Session> => {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('name', payload.name);
  form.append('bike_slug', payload.bike_slug);
  form.append('velocity_quantity', payload.velocity_quantity);
  form.append('column_map', JSON.stringify(payload.column_map));
  const { data } = await client.post('/sessions/upload', form);
  return data;
};

export const deleteSession = async (id: string): Promise<void> => {
  await client.delete(`/sessions/${id}`);
};
