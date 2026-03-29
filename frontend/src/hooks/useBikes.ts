import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBikes, createBike, updateBike, deleteBike } from '../api/bikes';
import type { BikeProfile } from '../types/bike';

export const useBikes = () => {
  return useQuery({ queryKey: ['bikes'], queryFn: getBikes });
};

export const useCreateBike = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBike,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bikes'] }),
  });
};

export const useUpdateBike = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, bike }: { slug: string; bike: Partial<BikeProfile> }) =>
      updateBike(slug, bike),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bikes'] }),
  });
};

export const useDeleteBike = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBike,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bikes'] }),
  });
};
