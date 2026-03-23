import api from './client';

export const trainersApi = {
  getAll: (params?: any) => api.get('/trainers', { params }).then(r => r.data),
  getBySport: (sport: string) => api.get(`/trainers/by-sport/${sport}`).then(r => r.data),
  getMe: () => api.get('/trainers/me').then(r => r.data),
  updateMe: (data: any) => api.patch('/trainers/me', data).then(r => r.data),
  getStudents: () => api.get('/trainers/me/students').then(r => r.data),
  rate: (data: { trainer_id: string; rating: number }) => api.post('/trainers/rate', data).then(r => r.data),
  getAll_admin: () => api.get('/trainers/all').then(r => r.data),
};
