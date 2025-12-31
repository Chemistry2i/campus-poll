import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173, // Set the default frontend port here
    strictPort: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443,
      // Use Codespaces forwarding domain when available; otherwise default
      host: process.env.CODESPACE_NAME
        ? `${process.env.CODESPACE_NAME}-5173.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev'}`
        : undefined,
    },
    proxy: {
      '/api': {
        target: 'https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
