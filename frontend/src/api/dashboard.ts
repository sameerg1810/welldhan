import { api } from './client';

export const getDashboardStats = () => api.get('/dashboard/stats');
export const getRecentBookings = () => api.get('/dashboard/recent-bookings');
export const getPaymentSummary = () => api.get('/dashboard/payment-summary');

