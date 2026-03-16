import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/-9-/', // GitHub Pages 레포지토리 이름
  plugins: [react()],
})
