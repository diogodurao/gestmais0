/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    globals: true,
    alias: {
      '@': resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
    },
    // IMPORTANT: Dependencies that should be interpreted by Vite to handle mocking correctly
    deps: {
      inline: [/src\/app\/actions/],
    },
  },
})
