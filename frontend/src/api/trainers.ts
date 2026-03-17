import { api } from './client';

export const getAllTrainers = () => api.get('/trainers');
export const getTrainersBySport = (sport: string) => api.get(`/trainers/by-sport/${sport}`);
export const getMyTrainerProfile = () => api.get('/trainers/me');
export const updateTrainerProfile = (data: any) => api.patch('/trainers/me', data);
export const getMyStudents = () => api.get('/trainers/me/students');
export const rateTrainer = (data: any) => api.post('/trainers/rate', data);

