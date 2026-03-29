import { useMutation, useQuery } from '@tanstack/react-query';
import { analyzeSession, getResult } from '../api/analyze';

export const useAnalysisResult = (sessionId: string | null) => {
  return useQuery({
    queryKey: ['analysis', sessionId],
    queryFn: () => getResult(sessionId!),
    enabled: !!sessionId,
  });
};

export const useAnalyzeSession = () => {
  return useMutation({
    mutationFn: analyzeSession,
  });
};
