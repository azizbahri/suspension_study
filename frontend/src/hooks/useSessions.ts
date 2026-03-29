import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSessions, importSession, deleteSession } from '../api/sessions';
import type { ImportPayload } from '../api/sessions';

export const useSessions = () => {
  return useQuery({ queryKey: ['sessions'], queryFn: getSessions });
};

export const useImportSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ImportPayload) => importSession(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
};

export const useDeleteSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
};
