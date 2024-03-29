import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: 'storycap', 
        replacement: resolve(__dirname, 'node_modules', 'storycap', 'lib')
      }
    ]
  },
})
