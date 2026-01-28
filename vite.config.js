import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      // Robust definition for Vercel deployment:
      // Defines only specific environment variables to avoid collisions with Node 'process' globals.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.API_Key || env.VITE_API_KEY || ''),
      'process.env.NODE_ENV': JSON.stringify(mode),
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