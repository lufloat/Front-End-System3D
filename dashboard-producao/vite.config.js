import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/catos': {
        target: 'http://192.168.148.19:18080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/catos/, ''),
      }
    }
  }
})