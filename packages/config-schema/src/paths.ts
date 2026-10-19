import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(currentDir, '../../..');
export const SCHEMA_OUTPUT_FILE = path.resolve(
    REPO_ROOT,
    'apps/api/resources/config-schema/wizard.schema.json',
);
export const FIXTURES_DIR = path.resolve(
    REPO_ROOT,
    'apps/api/resources/config-schema/fixtures/wizard',
);
