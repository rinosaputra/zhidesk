// File: src/renderer/src/components/theme/store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Themes } from './types'

interface ThemeState {
  theme: Themes
  setTheme: (theme: Themes) => void
  toggleTheme: () => void
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        }))
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export default useThemeStore
