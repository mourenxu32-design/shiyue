import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/app/',
  server: {
    port: 3001,
    host: true,
    strictPort: false,
  },
  build: {
    sourcemap: false,
  },
})
