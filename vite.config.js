import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/dfriapp/', // Base path for deployment
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Use @ for src/ folder
    },
  },
  server: {
    port: 3000, // Dev server port
    proxy: {
      '/api': {
        target: 'https://webstrategy.co.in/rssdi/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist', // Output directory for production build
    sourcemap: true, // Generate source maps for debugging
  },
})