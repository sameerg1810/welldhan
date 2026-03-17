import { api } from './client';

export const getMyHousehold = () => api.get('/households/me');
export const updateMyHousehold = (data: any) => api.patch('/households/me', data);
export const getMyMembers = () => api.get('/households/me/members');
export const addMember = (data: any) => api.post('/households/me/members', data);
export const updateMember = (id: string, data: any) => api.patch(`/households/me/members/${id}`, data);
export const deleteMember = (id: string) => api.delete(`/households/me/members/${id}`);

