import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dev: browser calls same origin `/ai/...` → forwarded to Express (avoids CORS and hard-coded ports).
      '/ai': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
