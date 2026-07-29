import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    globalSetup: ['./tests/globalSetup.ts'],
    setupFiles: ['./tests/setupEnv.ts'],
    // Test files share a single in-memory MongoDB instance and each clears
    // all collections in beforeEach — running files in parallel causes
    // cross-file data races, so they must run sequentially.
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['**/node_modules/**', 'dist/**', 'tests/**'],
    },
  },
});
