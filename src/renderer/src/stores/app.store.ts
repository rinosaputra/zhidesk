// File: src/renderer/src/stores/app.store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AppState {
  // UI State
  sidebarOpen: boolean
  currentView: string
  loading: boolean
  error: string | null

  // Actions
  setSidebarOpen: (open: boolean) => void
  setCurrentView: (view: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      currentView: 'dashboard',
      loading: false,
      error: null,

      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentView: (view) => set({ currentView: view }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'app-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)
