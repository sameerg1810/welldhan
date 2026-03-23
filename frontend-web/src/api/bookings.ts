import api from './client';

export const bookingsApi = {
  create: (data: any) => api.post('/bookings', data).then(r => r.data),
  getMine: () => api.get('/bookings/mine').then(r => r.data),
  getUpcoming: () => api.get('/bookings/mine/upcoming').then(r => r.data),
  getPast: () => api.get('/bookings/mine/past').then(r => r.data),
  cancel: (id: string) => api.patch(`/bookings/${id}/cancel`).then(r => r.data),
  getTrainerToday: () => api.get('/bookings/trainer').then(r => r.data),
  markAttendance: (data: { booking_id: string; status: string }) => api.patch('/bookings/attendance', data).then(r => r.data),
  getAll: (params?: any) => api.get('/bookings/all', { params }).then(r => r.data),
};
