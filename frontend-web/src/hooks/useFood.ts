import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foodApi } from '../api/food';

export const useFoodInventory = () =>
  useQuery({ queryKey: ['food', 'inventory'], queryFn: foodApi.getInventory });

export const useFoodPreferences = () =>
  useQuery({ queryKey: ['food', 'preferences'], queryFn: foodApi.getPreferences });

export const useMyFoodOrders = () =>
  useQuery({ queryKey: ['food', 'orders', 'mine'], queryFn: foodApi.getMyOrders });

export const useTodayFoodOrders = () =>
  useQuery({ queryKey: ['food', 'orders', 'today'], queryFn: foodApi.getTodayOrders });

export const useLowStock = () =>
  useQuery({ queryKey: ['food', 'inventory', 'low-stock'], queryFn: foodApi.getLowStock });

export const useToggleFoodItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: foodApi.toggleItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['food', 'preferences'] }),
  });
};

export const usePauseFoodDelivery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: foodApi.pauseAll,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['food'] }),
  });
};

export const useUpdateStock = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => foodApi.updateStock(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['food', 'inventory'] }),
  });
};
