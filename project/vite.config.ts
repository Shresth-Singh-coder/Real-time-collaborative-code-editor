import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
  },
  plugins: [react(),tailwindcss(),],
  build: {
    outDir: path.resolve(__dirname, '../backend/build'),
    emptyOutDir: true,
  }
})
