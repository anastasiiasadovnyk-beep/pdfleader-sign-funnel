import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import analyticsWriter from '@universe-forma/analytics-tagger/vite';

export default defineConfig({
  plugins: [react(), tailwindcss(), analyticsWriter()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { open: true },
  build: { outDir: 'build' },
});
