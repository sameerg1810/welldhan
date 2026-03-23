import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainersApi } from '../api/trainers';

export const useAllTrainers = (params?: any) =>
  useQuery({ queryKey: ['trainers', params], queryFn: () => trainersApi.getAll(params) });

export const useMyTrainerProfile = () =>
  useQuery({ queryKey: ['trainer', 'me'], queryFn: trainersApi.getMe });

export const useMyStudents = () =>
  useQuery({ queryKey: ['trainer', 'students'], queryFn: trainersApi.getStudents });

export const useUpdateTrainerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: trainersApi.updateMe,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainer', 'me'] }),
  });
};

export const useRateTrainer = () =>
  useMutation({ mutationFn: trainersApi.rate });
