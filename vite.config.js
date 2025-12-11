import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      // FIX: Added 'env.API_Key' to match your Vercel screenshot settings
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.API_Key || env.VITE_API_KEY || ''),
      'process.env': {}
    },
    build: {
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  }
})