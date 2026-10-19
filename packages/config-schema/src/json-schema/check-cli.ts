import fs from 'node:fs';
import { generateWizardJsonSchemaString } from './generator.js';
import { SCHEMA_OUTPUT_FILE } from '../paths.js';

export function checkSchemaFile(): void {
    if (!fs.existsSync(SCHEMA_OUTPUT_FILE)) {
        process.stderr.write(
            `Schema file does not exist: ${SCHEMA_OUTPUT_FILE}\n`,
        );
        process.exit(1);
    }
    const existing = fs.readFileSync(SCHEMA_OUTPUT_FILE, 'utf8');
    const fresh = generateWizardJsonSchemaString();
    if (existing !== fresh) {
        process.stderr.write(
            `Schema file is out of date: ${SCHEMA_OUTPUT_FILE}\nRun 'pnpm schema:generate' to regenerate.\n`,
        );
        process.exit(1);
    }
}

checkSchemaFile();
