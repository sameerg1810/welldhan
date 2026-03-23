import api from './client';

export const paymentsApi = {
  getMine: () => api.get('/payments/mine').then(r => r.data),
  getCurrent: () => api.get('/payments/mine/current').then(r => r.data),
  markPaid: (data: any) => api.patch('/payments/mark-paid', data).then(r => r.data),
  getPending: () => api.get('/payments/pending').then(r => r.data),
  getAll: (monthYear?: string) =>
    api.get('/payments/all', { params: { month_year: monthYear } }).then(r => r.data),
  generateMonthly: (data?: any) => api.post('/payments/generate-monthly', data).then(r => r.data),
};
