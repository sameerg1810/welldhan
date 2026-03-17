import { api } from './client';

export const getAllSlots = () => api.get('/slots');
export const getSlotsBySport = (sport: string) => api.get(`/slots/by-sport/${sport}`);
export const getTrainerSlots = () => api.get('/slots/trainer');

