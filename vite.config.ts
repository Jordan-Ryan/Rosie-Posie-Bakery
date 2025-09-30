import { defineConfig } from 'vite';
import { resolve } from 'path';

// For GitHub Pages: set base to the repository name so assets resolve correctly
// Repo: Rosie-Posie-Bakery
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Rosie-Posie-Bakery/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        buildACake: resolve(__dirname, 'build-a-cake.html'),
        sweetSelection: resolve(__dirname, 'sweet-selection.html'),
        sourdough: resolve(__dirname, 'sourdough.html'),
        terms: resolve(__dirname, 'terms.html'),
        wheel: resolve(__dirname, 'wheel.html')
      }
    }
  },
  server: {
    hmr: { overlay: true }
  }
});


