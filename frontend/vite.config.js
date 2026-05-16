import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api.php': {
        target: 'http://localhost/PHP/resq_php_react_final/backend/public',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
