import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: 'app',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app/'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('@mantine/')) {
            return 'mantine'
          }

          if (id.includes('@arwes/') || id.includes('/arwes/')) {
            return 'arwes'
          }

          if (id.includes('@tanstack/')) {
            return 'query-vendor'
          }

          return 'vendor'
        }
      }
    }
  },
  css: {
    postcss: null,
  },
  server: {
    host: 'localhost',
    port: 4242,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
