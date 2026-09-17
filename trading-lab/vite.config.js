import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  css: {
    postcss: fileURLToPath(new URL('./postcss.config.mjs', import.meta.url)),
  },
});
