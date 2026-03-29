import { client } from './client';
import type { AnalysisResult } from '../types/analysis';

export interface ComparePayload {
  session_ids: string[];
  granularity: 'session' | 'segment';
  segment_duration_s?: number;
}

export interface CompareResult {
  sessions: Array<{
    session_id: string;
    session_name: string;
    result: AnalysisResult;
  }>;
}

export const compareSession = async (payload: ComparePayload): Promise<CompareResult> => {
  const { data } = await client.post('/compare', payload);
  return data;
};
