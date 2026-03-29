import { client } from './client';

export interface DemoStatus {
  session_count: number;
  bike_count: number;
  analyzed_count: number;
  demo_session_id: string | null;
}

export const getDemoStatus = async (): Promise<DemoStatus> => {
  const { data } = await client.get('/demo');
  return data;
};
