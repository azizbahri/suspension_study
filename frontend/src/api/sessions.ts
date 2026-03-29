import { client } from './client';
import type { Session, ColumnMap } from '../types/session';

export interface ImportPayload {
  csv_path: string;
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

export const deleteSession = async (id: string): Promise<void> => {
  await client.delete(`/sessions/${id}`);
};
