import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All API calls go through /api prefix
      // The rewrite strips /api before forwarding to backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      
      // WebSocket - no prefix needed, this is a direct connection
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true
      }
    }
  }
})