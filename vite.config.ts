import { defineConfig } from 'vite';

// For GitHub Pages: set base to the repository name so assets resolve correctly
// Repo: Rosie-Posie-Bakery
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Rosie-Posie-Bakery/' : '/',
  server: {
    hmr: { overlay: true }
  }
});


