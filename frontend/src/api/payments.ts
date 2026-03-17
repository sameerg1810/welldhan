import { api } from './client';

export const getMyPayments = () => api.get('/payments/mine');
export const getCurrentPayment = () => api.get('/payments/mine/current');
export const markPaymentPaid = (data: any) => api.patch('/payments/mark-paid', data);
export const getPendingPayments = () => api.get('/payments/pending');

