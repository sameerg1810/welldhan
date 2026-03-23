import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'User' | 'Trainer' | 'Manager' | 'Admin' | null;

interface AuthState {
  token: string | null;
  role: Role;
  userId: string | null;
  userData: any | null;
  setAuth: (token: string, role: Role, userId: string, userData: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      userData: null,
      setAuth: (token, role, userId, userData) =>
        set({ token, role, userId, userData }),
      clearAuth: () =>
        set({ token: null, role: null, userId: null, userData: null }),
    }),
    { name: 'welldhan_auth' }
  )
);
