/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/minsyong-cultural-atlas/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
