/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { sharePages } from './vite.sharePages'

export default defineConfig({
  base: '/minsyong-cultural-atlas/',
  plugins: [react(), tailwindcss(), sharePages()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  build: { chunkSizeWarningLimit: 2000 }, // maplibre-gl 本身就超過 1 MB
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
