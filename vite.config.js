import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use root base for Vercel, /FinanceCalc/ for GitHub Pages
  base: process.env.VERCEL ? '/' : '/FinanceCalc/',
  plugins: [react()],
})
