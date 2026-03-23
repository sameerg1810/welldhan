import api from './client';
import axios from 'axios';

const authApi = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export const authApiCalls = {
  login: (data: { email: string; password: string }) =>
    authApi.post('/auth/login', data).then(r => r.data),
  signup: (data: any) =>
    authApi.post('/auth/signup', data).then(r => r.data),
  signupTrainer: (data: any) =>
    authApi.post('/auth/signup/trainer', data).then(r => r.data),
  sendOtp: (data: { challenge_id: string }) =>
    authApi.post('/2fa/sms/send-otp', data).then(r => r.data),
  verifyOtp: (data: { challenge_id: string; otp: string }) =>
    authApi.post('/2fa/sms/verify-otp', data).then(r => r.data),
  getPackages: () => authApi.get('/packages').then(r => r.data),
};
