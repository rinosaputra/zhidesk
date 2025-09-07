// File: src/renderer/src/stores/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (userData) =>
        set({
          user: userData,
          isAuthenticated: true
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }))
    }),
    {
      name: 'auth-storage'
    }
  )
)
