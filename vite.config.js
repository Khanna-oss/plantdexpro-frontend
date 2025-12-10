import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // SECURITY: Disable source maps in production to prevent code inspection
    sourcemap: false,
    // SECURITY: Aggressive minification using terser
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs and debuggers in production to prevent leaking info
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        // Remove comments to reduce footprint and hints
        comments: false,
      },
    },
  },
})