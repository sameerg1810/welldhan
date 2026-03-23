import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments';

export const useMyPayments = () =>
  useQuery({ queryKey: ['payments', 'mine'], queryFn: paymentsApi.getMine });

export const useCurrentPayment = () =>
  useQuery({ queryKey: ['payments', 'current'], queryFn: paymentsApi.getCurrent });

export const usePendingPayments = () =>
  useQuery({ queryKey: ['payments', 'pending'], queryFn: paymentsApi.getPending });

export const useAllPayments = (monthYear?: string) =>
  useQuery({
    queryKey: ['payments', 'all', monthYear],
    queryFn: () => paymentsApi.getAll(monthYear),
  });

export const useMarkPaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.markPaid,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });
};

export const useGenerateMonthly = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.generateMonthly,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });
};
