// Fails the build when the production bundle contains dev-only or sensitive strings.
// Why: the Vite container sets NODE_ENV=development, which silently produces a dev-flavoured
// bundle (dev routes, dev login hint). `pnpm build` forces NODE_ENV=production and then runs this check.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import console from 'node:console';
import process from 'node:process';

const FORBIDDEN = [
    'Password1234',
    'AIzaSy',
    'plan3d-demo',
    'Component Showcase',
    'user@aihome.local',
];
const root = fileURLToPath(new URL('../public/build/assets/', import.meta.url));

function* walk(dir) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) yield* walk(p);
        else if (/\.(js|css|html|json)$/.test(name)) yield p;
    }
}

const hits = [];
for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8');
    for (const needle of FORBIDDEN)
        if (text.includes(needle)) hits.push(`${needle} in ${file}`);
}
if (hits.length > 0) {
    console.error('verify-build FAILED:\n' + hits.join('\n'));
    process.exit(1);
}
console.log('verify-build OK: no forbidden strings in the production bundle');
