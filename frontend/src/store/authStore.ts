import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Role, Household, Trainer, Community, AdminUser } from '../types';

interface AuthStore {
  token: string | null;
  role: Role | null;
  userId: string | null;
  userData: Household | Trainer | Community | AdminUser | null;
  isLoading: boolean;
  isHydrated: boolean;

  setAuth: (token: string, role: Role, userId: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateUserData: (data: any) => void;
}

const AUTH_KEY = 'welldhan_auth';

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  role: null,
  userId: null,
  userData: null,
  isLoading: false,
  isHydrated: false,

  setAuth: async (token, role, userId, userData) => {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ token, role, userId, userData }));
    set({ token, role, userId, userData });
  },

  logout: async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    set({ token: null, role: null, userId: null, userData: null });
  },

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      if (stored) {
        const { token, role, userId, userData } = JSON.parse(stored);
        set({ token, role, userId, userData, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },

  updateUserData: (data) => set({ userData: data }),
}));
