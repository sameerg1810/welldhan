import { api } from './client';

export const createBooking = (data: any) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/mine');
export const getUpcomingBookings = () => api.get('/bookings/mine/upcoming');
export const cancelBooking = (id: string) => api.patch(`/bookings/${id}/cancel`, {});
export const getTrainerBookings = () => api.get('/bookings/trainer');
export const markAttendance = (data: any) => api.patch('/bookings/attendance', data);

