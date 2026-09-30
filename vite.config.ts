import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages 專案站台部署在 /<repo>/ 子路徑底下,由 .github/workflows/deploy.yml
  // 透過 BASE_PATH 傳入;本機開發與一般 build 維持根路徑。
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
})
