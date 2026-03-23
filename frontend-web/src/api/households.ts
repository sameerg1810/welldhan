import api from './client';

export const householdsApi = {
  getMe: () => api.get('/households/me').then(r => r.data),
  updateMe: (data: any) => api.patch('/households/me', data).then(r => r.data),
  getMembers: () => api.get('/households/me/members').then(r => r.data),
  addMember: (data: any) => api.post('/households/me/members', data).then(r => r.data),
  updateMember: (id: string, data: any) => api.patch(`/households/me/members/${id}`, data).then(r => r.data),
  deleteMember: (id: string) => api.delete(`/households/me/members/${id}`).then(r => r.data),
  getAll: () => api.get('/households').then(r => r.data),
  getById: (id: string) => api.get(`/households/${id}`).then(r => r.data),
};
