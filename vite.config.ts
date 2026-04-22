import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/chiversi/',
  test: {
    environment: 'jsdom',
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/game/**', 'src/graph/**'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
});
