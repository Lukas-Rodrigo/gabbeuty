import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    include: ['test/integration/**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    setupFiles: ['./test/setup/setup.e2e.ts'],
    pool: 'forks',
    fileParallelism: false,
  },
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './test'),
    },
  },
});
