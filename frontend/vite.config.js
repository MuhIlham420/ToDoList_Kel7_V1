import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/ToDoList_Kel7_V1/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
