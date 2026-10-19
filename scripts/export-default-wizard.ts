import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serializeWizardConfig } from '@aihome/config-schema';
import { validatedDefaultWizard } from '../apps/api/resources/js/features/wizard/data/load-wizard';

export function exportDefaultWizard(): string {
    const json = serializeWizardConfig(validatedDefaultWizard);

    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const rootDir = path.resolve(scriptDir, '..');

    const candidatePaths = [
        path.resolve(rootDir, 'apps/api/storage/app/default-wizard.json'),
        path.resolve(process.cwd(), 'storage/app/default-wizard.json'),
        path.resolve(process.cwd(), 'apps/api/storage/app/default-wizard.json'),
    ];

    let writtenPath: string | null = null;
    for (const targetPath of candidatePaths) {
        const dir = path.dirname(targetPath);
        if (fs.existsSync(dir)) {
            fs.writeFileSync(targetPath, json + '\n', 'utf-8');
            writtenPath = targetPath;
            break;
        }
    }

    if (writtenPath === null) {
        const fallback = candidatePaths[0];
        if (fallback !== undefined) {
            fs.mkdirSync(path.dirname(fallback), { recursive: true });
            fs.writeFileSync(fallback, json + '\n', 'utf-8');
            writtenPath = fallback;
        }
    }

    return writtenPath ?? '';
}

const outputPath = exportDefaultWizard();
if (outputPath !== '') {
    // eslint-disable-next-line no-console
    console.log(`Successfully exported default wizard to: ${outputPath}`);
}
