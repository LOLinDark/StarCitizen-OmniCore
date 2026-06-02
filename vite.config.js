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
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'app/index.html'),
        // hotasOverlayPopout: path.resolve(__dirname, 'app/popout/HOTASOverlayPopout.html'), // Removed: file missing
      },
      output: {
        manualChunks(id) {
          const normalizedId = id.split(path.sep).join('/')

          if (!normalizedId.includes('/node_modules/')) {
            return undefined
          }

          if (normalizedId.includes('/@mantine/')) {
            return 'mantine'
          }

          if (normalizedId.includes('/@arwes/') || normalizedId.includes('/arwes/')) {
            return 'arwes'
          }

          if (normalizedId.includes('/@tanstack/')) {
            return 'query-vendor'
          }

          if (
            normalizedId.includes('/react/') ||
            normalizedId.includes('/react-dom/')
          ) {
            return 'react-vendor'
          }

          if (
            normalizedId.includes('/react-router/') ||
            normalizedId.includes('/react-router-dom/') ||
            normalizedId.includes('/history/')
          ) {
            return 'router-vendor'
          }

          if (
            normalizedId.includes('/motion/') ||
            normalizedId.includes('/react-draggable/') ||
            normalizedId.includes('/react-moveable/') ||
            normalizedId.includes('/react-resizable/') ||
            normalizedId.includes('/@daybrush/')
          ) {
            return 'interaction-vendor'
          }

          if (
            normalizedId.includes('/@tabler/icons-react/') ||
            normalizedId.includes('/tabler-icons-react/')
          ) {
            return 'icons-vendor'
          }

          if (
            normalizedId.includes('/zustand/') ||
            normalizedId.includes('/dayjs/') ||
            normalizedId.includes('/web-vitals/')
          ) {
            return 'state-vendor'
          }

          return undefined
        }
      }
    }
  },
  css: {
    postcss: null,
  },
  server: {
    host: '127.0.0.1',
    port: 4242,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3101',
        changeOrigin: true
      }
    }
  }
}))
