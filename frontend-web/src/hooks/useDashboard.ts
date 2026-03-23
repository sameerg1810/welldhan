import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

export const useDashboardSummary = () =>
  useQuery({ queryKey: ['dashboard', 'summary'], queryFn: dashboardApi.getSummary });

export const useDashboardStats = () =>
  useQuery({ queryKey: ['dashboard', 'stats'], queryFn: dashboardApi.getStats });

export const useRecentBookings = () =>
  useQuery({ queryKey: ['dashboard', 'recent-bookings'], queryFn: dashboardApi.getRecentBookings });

export const usePaymentSummary = () =>
  useQuery({ queryKey: ['dashboard', 'payment-summary'], queryFn: dashboardApi.getPaymentSummary });
