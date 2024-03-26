import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path'

console.log('Loaded vitest config');
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupFile.js',
  },
  resolve: {
    alias: [
      {
        find: 'storycap', 
        replacement: resolve(__dirname, 'node_modules', 'storycap', 'lib')
      }
    ]
  },
});
