import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Import it
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Activate it
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})