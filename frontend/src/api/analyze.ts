import { client } from './client';
import type { AnalysisResult } from '../types/analysis';

export const analyzeSession = async (id: string): Promise<AnalysisResult> => {
  const { data } = await client.post(`/analyze/${id}`);
  return data;
};

export const getResult = async (id: string): Promise<AnalysisResult> => {
  const { data } = await client.get(`/analyze/${id}`);
  return data;
};
