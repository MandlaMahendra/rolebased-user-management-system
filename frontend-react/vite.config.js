import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy all /api requests to the backend so there are ZERO CORS issues
    proxy: {
      '/api': {
        target: 'https://rolebased-user-management-system.onrender.com',
        changeOrigin: true,
        // Show clear console warnings instead of silent failures
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[Vite Proxy] Backend connection failed:', err.message);
            console.error('[Vite Proxy] Make sure the backend is running: cd backend && npm run dev');
          });
        },
      },
    },
  },
})
