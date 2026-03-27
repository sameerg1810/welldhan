import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  role: 'User' | 'Trainer' | 'Manager' | 'Admin' | null
  userId: string | null
  userData: any | null
  isAuthenticated: boolean
  setAuth: (token: string, role: string, userId: string, userData: any) => void
  clearAuth: () => void
  updateUserData: (data: any) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      role: null,
      userId: null,
      userData: null,
      isAuthenticated: false,

      setAuth: (token: string, role: string, userId: string, userData: any) => {
        set({
          token,
          role: role as any,
          userId,
          userData,
          isAuthenticated: true,
        })
      },

      clearAuth: () => {
        set({
          token: null,
          role: null,
          userId: null,
          userData: null,
          isAuthenticated: false,
        })
      },

      updateUserData: (data: any) => {
        set((state) => ({
          userData: { ...state.userData, ...data },
        }))
      },
    }),
    {
      name: 'welldhan-auth',
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        userId: state.userId,
        userData: state.userData,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
