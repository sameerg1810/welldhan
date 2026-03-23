import api from './client';

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary').then(r => r.data),
  getStats: () => api.get('/dashboard/stats').then(r => r.data),
  getRecentBookings: () => api.get('/dashboard/recent-bookings').then(r => r.data),
  getPaymentSummary: () => api.get('/dashboard/payment-summary').then(r => r.data),
};
