import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import relay from 'vite-plugin-relay'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [tailwindcss(), tsconfigPaths(), tanstackStart(), react(), relay],
})
