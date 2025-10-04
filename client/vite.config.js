import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Remove CSP for development to allow OCR workers
    // In production, implement proper CSP with worker-src blob: directive
    headers: process.env.NODE_ENV === 'development' ? {} : {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; worker-src 'self' blob: data: https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; connect-src 'self' ws: wss: http: https:; font-src 'self' data: https:; object-src 'none';"
    }
  }
})
