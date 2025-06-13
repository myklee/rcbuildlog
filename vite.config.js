import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/rcbuildlog/' : '/',
  server: {
    port: 3333,  // Replace with the port you want to use
  },
})
