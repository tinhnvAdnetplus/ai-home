import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./resources/js/setupTests.ts'],
        include: ['resources/js/**/*.{test,spec}.{ts,tsx}'],
        // jsdom + axe tests are CPU heavy; the 5 s default produced false failures when the machine was busy (parallel runs, other agents).
        testTimeout: 20_000,
        hookTimeout: 20_000,
    },
});
