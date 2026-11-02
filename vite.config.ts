import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` emits dist/index.html as ONE self-contained file (JS, CSS, fonts inlined)
// plus dist/sources/*.pdf, so the platform also opens straight from disk without a server.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    chunkSizeWarningLimit: 8000,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    testTimeout: 30000,
  },
})
