// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    alias: {
      '@service': resolve(__dirname, 'src/service'),
      '@schema': resolve(__dirname, 'src/schema')
    },
    globals: true
  }
})
