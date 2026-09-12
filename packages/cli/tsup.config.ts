import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/index.ts'],
  format: ['esm'],
  sourcemap: false,
  minify: false,
  target: 'node24',
  outDir: 'dist',
  treeshake: true,
});
