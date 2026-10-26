import { configDefaults, defineConfig } from 'vitest/config'
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
    // .claude/worktrees/ 底下是其他分支的完整副本（含自己的測試）：在主資料夾跑 npm test 時不能掃進去
    exclude: [...configDefaults.exclude, '**/.claude/**'],
  },
})
