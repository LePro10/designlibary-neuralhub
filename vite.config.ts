import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// Served from the custom domain ui.neuralhub.dev (root); override PAGES_BASE for a project-path deploy.
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
