import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/login': 'http://localhost:5000',
      '/logout': 'http://localhost:5000',
      '/api': 'http://localhost:5000',
      '/dashboard': 'http://localhost:5000',
      '/donors': 'http://localhost:5000',
      '/donor_health': 'http://localhost:5000',
      '/donations': 'http://localhost:5000',
      '/stock': 'http://localhost:5000',
      '/requests': 'http://localhost:5000',
      '/hospitals': 'http://localhost:5000',
      '/blood_banks': 'http://localhost:5000',
      '/notifications': 'http://localhost:5000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
