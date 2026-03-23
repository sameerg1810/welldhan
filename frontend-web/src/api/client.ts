import axios from 'axios';

// Vite exposes env via import.meta.env in the browser; avoid using process.env.
const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api';

const storage = {
  getToken: () => localStorage.getItem('token') || null,
  setToken: (t: string | null) => {
    if (t) localStorage.setItem('token', t);
    else localStorage.removeItem('token');
  },
};

const client = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

client.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default {
  // Auth
  auth: {
    login: (payload: { email: string; password: string }) => client.post('/v1/auth/login', payload).then(r => r.data),
    signup: (payload: any) => client.post('/v1/auth/signup', payload).then(r => r.data),
    signupTrainer: (payload: any) => client.post('/v1/auth/signup/trainer', payload).then(r => r.data),
    signupManager: (payload: any) => client.post('/v1/auth/signup/manager', payload).then(r => r.data),
    sendOtp: (payload: { challenge_id: string }) => client.post('/v1/2fa/sms/send-otp', payload).then(r => r.data),
    verifyOtp: (payload: { challenge_id: string; otp: string }) => client.post('/v1/2fa/sms/verify-otp', payload).then(r => r.data).then((data) => {
      if (data && data.token) storage.setToken(data.token);
      return data;
    }),
    logout: () => { storage.setToken(null); return Promise.resolve(); },
  },

  // Households
  households: {
    me: () => client.get('/v1/households/me').then(r => r.data),
    updateMe: (payload: any) => client.patch('/v1/households/me', payload).then(r => r.data),
    members: {
      list: () => client.get('/v1/households/me/members').then(r => r.data),
      create: (payload: any) => client.post('/v1/households/me/members', payload).then(r => r.data),
      update: (member_id: string, payload: any) => client.patch(`/v1/households/me/members/${member_id}`, payload).then(r => r.data),
      delete: (member_id: string) => client.delete(`/v1/households/me/members/${member_id}`).then(r => r.data),
    }
  },

  // Bookings
  bookings: {
    create: (payload: any) => client.post('/v1/bookings', payload).then(r => r.data),
    mine: () => client.get('/v1/bookings/mine').then(r => r.data),
    upcoming: () => client.get('/v1/bookings/mine/upcoming').then(r => r.data),
    past: () => client.get('/v1/bookings/mine/past').then(r => r.data),
    cancel: (booking_id: string) => client.patch(`/v1/bookings/${booking_id}/cancel`).then(r => r.data),
    trainerToday: () => client.get('/v1/bookings/trainer').then(r => r.data),
    attendance: (payload: { booking_id: string; status: string }) => client.patch('/v1/bookings/attendance', payload).then(r => r.data),
    all: (params?: any) => client.get('/v1/bookings/all', { params }).then(r => r.data),
  },

  // Slots
  slots: {
    list: (params?: any) => client.get('/v1/slots', { params }).then(r => r.data),
    availability: (params?: any) => client.get('/v1/slots/availability', { params }).then(r => r.data),
  },

  // Packages
  packages: {
    list: () => client.get('/v1/packages').then(r => r.data),
  },

  // Payments
  payments: {
    create: (payload: any) => client.post('/v1/payments', payload).then(r => r.data),
    list: () => client.get('/v1/payments').then(r => r.data),
  },

  // Trainers
  trainers: {
    list: (params?: any) => client.get('/v1/trainers', { params }).then(r => r.data),
  },

  // Notifications
  notifications: {
    list: () => client.get('/v1/notifications').then(r => r.data),
  }
};
