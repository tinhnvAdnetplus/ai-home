import fs from 'node:fs';
import path from 'node:path';
import { generateWizardJsonSchemaString } from './generator.js';
import { SCHEMA_OUTPUT_FILE } from '../paths.js';

export function generateSchemaFile(): void {
    const content = generateWizardJsonSchemaString();
    fs.mkdirSync(path.dirname(SCHEMA_OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(SCHEMA_OUTPUT_FILE, content, 'utf8');
}

generateSchemaFile();
