import { client } from './client';
import type { BikeProfile } from '../types/bike';

export const getBikes = async (): Promise<BikeProfile[]> => {
  const { data } = await client.get('/bikes');
  return data;
};

export const createBike = async (bike: BikeProfile): Promise<BikeProfile> => {
  const { data } = await client.post('/bikes', bike);
  return data;
};

export const updateBike = async (slug: string, bike: Partial<BikeProfile>): Promise<BikeProfile> => {
  const { data } = await client.put(`/bikes/${slug}`, bike);
  return data;
};

export const deleteBike = async (slug: string): Promise<void> => {
  await client.delete(`/bikes/${slug}`);
};
