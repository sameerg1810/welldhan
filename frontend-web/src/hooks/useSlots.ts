import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slotsApi } from '../api/slots';

export const useAllSlots = (params?: any) =>
  useQuery({ queryKey: ['slots', params], queryFn: () => slotsApi.getAll(params) });

export const useTrainerSlots = () =>
  useQuery({ queryKey: ['slots', 'trainer'], queryFn: slotsApi.getTrainerSlots });

export const useCreateSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: slotsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slots'] }),
  });
};

export const useUpdateSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => slotsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slots'] }),
  });
};

export const useDeleteSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => slotsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slots'] }),
  });
};
