import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    setupFiles: ['./tests/setup.ts'],
  },
})
