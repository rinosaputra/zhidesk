// File: src/renderer/src/stores/theme.types.ts
export const Themes = {
  system: 'system',
  light: 'light',
  dark: 'dark'
} as const

export type Themes = keyof typeof Themes
