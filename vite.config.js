import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => ({
  root: 'app',
  // Public directory is at project root (not under app/)
  publicDir: '../public',
  // Use subdirectory base only for production builds (GitHub Pages)
  // Local dev server uses root path for easier testing
  base: command === 'build' ? '/StarCitizen-OmniCore/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app/'),
    },
  },
  build: {
    outDir: '../dist',
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
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}))
