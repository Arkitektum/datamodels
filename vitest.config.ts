import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

// jsdom-miljø gir DOMParser, som lib/xsd.ts (parseXsd) trenger.
// '@'-aliaset peker på prosjektroten, slik testene kan bruke '@/lib/...'.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['lib/__tests__/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
