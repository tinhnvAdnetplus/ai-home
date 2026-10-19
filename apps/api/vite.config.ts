import path from 'node:path';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dev server is only used locally (HMR). Production serves the built files in public/build
// straight from Laravel, so the live server needs a single PHP port and no Node.
const devOrigin = process.env.VITE_DEV_ORIGIN ?? 'http://localhost:5173';

export default defineConfig(({ mode }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app/main.tsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
        // Vite still emits a chunk for a dynamic import() inside a `import.meta.env.DEV ? ... : null` branch (verified: ~150 kB
        // dev-showcase chunk in public/build), so the dev-only showcase import is stubbed out in production builds.
        {
            name: 'tree-shake-dev-showcase',
            enforce: 'pre',
            transform(code, id) {
                if (
                    mode === 'production' &&
                    (id.includes('App.tsx') || id.includes('AppRoutes.tsx'))
                ) {
                    return {
                        code: code.replace(
                            /import\(['"]\.\/dev\/dev-showcase['"]\)/g,
                            'Promise.resolve({ DevShowcase: () => null, default: () => null })',
                        ),
                        map: null,
                    };
                }
            },
        },
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        origin: devOrigin,
        cors: true,
        watch: {
            usePolling: true,
            ignored: ['**/storage/framework/views/**', '**/vendor/**'],
        },
    },
}));
