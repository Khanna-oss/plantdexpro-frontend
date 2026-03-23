import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      // Expose VITE_GEMINI_API_KEY as both import.meta.env (auto) and process.env.API_KEY
      // so the @google/genai SDK can also pick it up if it reads process.env.API_KEY.
      // IMPORTANT: Set VITE_GEMINI_API_KEY in your Vercel Environment Variables dashboard,
      // not just in .env — Vercel reads it at build time and bakes it into the bundle.
      'process.env.API_KEY': JSON.stringify(
        env.VITE_GEMINI_API_KEY || env.API_KEY || ''
      ),
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