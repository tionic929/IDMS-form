import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        // target: 'https://dashboard-ncnian-id.svizcarra.online',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/bridge': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/bridge/, ''),
      },
    },
    host: true,
    port: 5172,
    strictPort: true,
  },
  optimizeDeps: {
    include: ['react-signature-canvas'],
    exclude: ['@imgly/background-removal']
  },
  base: '/',
})