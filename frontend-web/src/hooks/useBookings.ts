import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';

export const useUpcomingBookings = () =>
  useQuery({ queryKey: ['bookings', 'upcoming'], queryFn: bookingsApi.getUpcoming });

export const usePastBookings = () =>
  useQuery({ queryKey: ['bookings', 'past'], queryFn: bookingsApi.getPast });

export const useAllMyBookings = () =>
  useQuery({ queryKey: ['bookings', 'mine'], queryFn: bookingsApi.getMine });

export const useAllBookings = (params?: any) =>
  useQuery({ queryKey: ['bookings', 'all', params], queryFn: () => bookingsApi.getAll(params) });

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
    },
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
};

export const useTrainerBookings = () =>
  useQuery({ queryKey: ['trainer', 'bookings'], queryFn: bookingsApi.getTrainerToday });

export const useMarkAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookingsApi.markAttendance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainer', 'bookings'] }),
  });
};
