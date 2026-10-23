import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// GitHub Pages serves the showcase under /<repo>/; locally it runs at /.
export default defineConfig({
  base: process.env.PAGES_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@ui': fileURLToPath(new URL('./ui', import.meta.url)),
      '@site': fileURLToPath(new URL('./site', import.meta.url)),
    },
  },
});
