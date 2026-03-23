import api from './client';

export const slotsApi = {
  getAll: (params?: any) => api.get('/slots', { params }).then(r => r.data),
  getBySport: (sport: string) => api.get(`/slots/by-sport/${sport}`).then(r => r.data),
  getTrainerSlots: () => api.get('/slots/trainer').then(r => r.data),
  create: (data: any) => api.post('/slots', data).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/slots/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/slots/${id}`).then(r => r.data),
  getAvailability: (params?: any) => api.get('/slots/availability', { params }).then(r => r.data),
};
