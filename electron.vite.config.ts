import { resolve } from 'node:path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Alias comuni: il codice condiviso si importa sempre come @shared/...
const shared = resolve('src/shared');

// In sviluppo rimuove la CSP da index.html: il preamble di React Refresh è uno script inline
// che la CSP bloccherebbe, e il dev server usa WebSocket per l'HMR. In produzione la CSP resta.
const devWithoutCsp = {
  name: 'dev-without-csp',
  apply: 'serve' as const,
  transformIndexHtml: (html: string) =>
    html.replace(/<meta\s+http-equiv="Content-Security-Policy"[^>]*>/, ''),
};

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { '@shared': shared } },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { '@shared': shared } },
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react(), tailwindcss(), devWithoutCsp],
    resolve: {
      alias: {
        '@shared': shared,
        '@renderer': resolve('src/renderer/src'),
      },
    },
  },
});
