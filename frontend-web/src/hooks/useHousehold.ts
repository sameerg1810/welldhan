import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { householdsApi } from '../api/households';

export const useMyHousehold = () =>
  useQuery({ queryKey: ['household', 'me'], queryFn: householdsApi.getMe });

export const useMyMembers = () =>
  useQuery({ queryKey: ['members'], queryFn: householdsApi.getMembers });

export const useAllHouseholds = () =>
  useQuery({ queryKey: ['households', 'all'], queryFn: householdsApi.getAll });

export const useAddMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: householdsApi.addMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
};

export const useUpdateMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      householdsApi.updateMember(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
};

export const useDeleteMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => householdsApi.deleteMember(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
};

export const useUpdateHousehold = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: householdsApi.updateMe,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['household', 'me'] }),
  });
};
