import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';

const here = fileURLToPath(new URL('.', import.meta.url));
const blocksDir = resolve(here, 'blocks');

const blockEntries = Object.fromEntries(
  readdirSync(blocksDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => [`block-${f.replace('.html', '')}`, resolve(blocksDir, f)]),
);

export default defineConfig({
  root: '.',
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(here, 'index.html'),
        ...blockEntries,
      },
    },
  },
});
