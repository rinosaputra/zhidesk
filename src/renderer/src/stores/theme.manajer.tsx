// File: src/renderer/src/stores/theme.manajer.tsx
import * as React from 'react'
import useThemeStore from './theme.store'
import { Themes } from './theme.types'

const ThemeManajer: React.FC = () => {
  const { theme } = useThemeStore()
  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove(Themes.light, Themes.dark)

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? Themes.dark
        : Themes.light

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  return null
}

export default ThemeManajer
