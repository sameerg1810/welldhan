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
  colorScheme: 'light' | 'dark';

  setAuth: (token: string, role: Role, userId: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateUserData: (data: any) => void;
  setColorScheme: (scheme: 'light' | 'dark') => Promise<void>;
}

const AUTH_KEY = 'welldhan_auth';
const THEME_KEY = 'welldhan_theme';

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  role: null,
  userId: null,
  userData: null,
  isLoading: false,
  isHydrated: false,
  colorScheme: 'light',

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
      const [storedAuth, storedTheme] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(THEME_KEY),
      ]);
      
      let authData = {};
      if (storedAuth) {
        authData = JSON.parse(storedAuth);
      }
      
      set({ 
        ...authData, 
        colorScheme: (storedTheme as 'light' | 'dark') || 'light',
        isHydrated: true 
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  updateUserData: (data) => set({ userData: data }),

  setColorScheme: async (scheme) => {
    await AsyncStorage.setItem(THEME_KEY, scheme);
    set({ colorScheme: scheme });
  },
}));

