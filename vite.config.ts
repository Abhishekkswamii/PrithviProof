import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
  preview: {
    port: 3000,
    host: '127.0.0.1',
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Split stable third-party code into predictable chunks.
        // firebase/ai is NOT listed here: it is dynamically imported by
        // FirebaseAiAssistantRepository and Rollup will automatically place
        // it in a separate lazy chunk outside the initial load graph.
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/app-check'],
          ui: ['lucide-react'],
        },
      },
    },
  },
});
