import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import { parseWizardConfig } from '../wizard/validate.js';
import { SCHEMA_OUTPUT_FILE, FIXTURES_DIR } from '../paths.js';
import { type FixtureFileContent } from '../fixtures/types.js';

function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function isFixtureFileContent(val: unknown): val is FixtureFileContent {
    return (
        isRecord(val) &&
        typeof val.name === 'string' &&
        typeof val.description === 'string' &&
        isRecord(val.expected) &&
        (val.structural === 'valid' || val.structural === 'invalid')
    );
}

interface Disagreement {
    file: string;
    name: string;
    expectedStructural: string;
    isAjvValid: boolean;
    ajvErrors: string;
    divergence?: string | undefined;
}

export function runDifferentialVerification(): void {
    if (!fs.existsSync(SCHEMA_OUTPUT_FILE) || !fs.existsSync(FIXTURES_DIR)) {
        process.stderr.write('Missing schema or fixtures directory\n');
        process.exit(1);
    }

    const rawSchema = fs.readFileSync(SCHEMA_OUTPUT_FILE, 'utf8');
    const parsedSchema: unknown = JSON.parse(rawSchema);
    if (!isRecord(parsedSchema)) {
        process.stderr.write('Schema file does not parse as an object\n');
        process.exit(1);
    }

    const ajv = new Ajv({
        strict: true,
        keywords: ['x-schemaVersion'],
    });

    if (!ajv.validateSchema(parsedSchema)) {
        process.stderr.write(
            `Schema is not valid draft-07: ${JSON.stringify(ajv.errors)}\n`,
        );
        process.exit(1);
    }

    const validate = ajv.compile(parsedSchema);
    const files = fs
        .readdirSync(FIXTURES_DIR)
        .filter((f) => f.endsWith('.json'))
        .sort();

    const disagreements: Disagreement[] = [];
    let matchedCount = 0;

    for (const filename of files) {
        const filePath = path.join(FIXTURES_DIR, filename);
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsedFixture: unknown = JSON.parse(raw);
        if (!isFixtureFileContent(parsedFixture)) {
            process.stderr.write(`Malformed fixture file: ${filename}\n`);
            process.exit(1);
        }

        const isValidAjv = validate(parsedFixture.input);
        const isExpectedValid = parsedFixture.structural === 'valid';

        const liveParse = parseWizardConfig(parsedFixture.input);
        const liveCodes = liveParse.ok
            ? []
            : Array.from(new Set(liveParse.issues.map((i) => i.code))).sort();

        if (liveParse.ok !== parsedFixture.expected.ok) {
            process.stderr.write(`Live parse mismatch ok: ${filename}\n`);
            process.exit(1);
        }

        const hasMatchingCodes =
            liveCodes.length === parsedFixture.expected.codes.length &&
            liveCodes.every(
                (c, idx) => c === parsedFixture.expected.codes[idx],
            );

        if (!hasMatchingCodes) {
            process.stderr.write(`Live parse codes mismatch: ${filename}\n`);
            process.exit(1);
        }

        if (isValidAjv !== isExpectedValid) {
            disagreements.push({
                file: filename,
                name: parsedFixture.name,
                expectedStructural: parsedFixture.structural,
                isAjvValid: isValidAjv,
                ajvErrors: JSON.stringify(validate.errors ?? []),
                divergence: parsedFixture.knownDivergence,
            });
        } else {
            matchedCount++;
        }
    }

    if (disagreements.length > 0) {
        process.stderr.write(
            `\n❌ Disagreements found: ${disagreements.length.toString()}\n`,
        );
        process.exit(1);
    }

    process.stdout.write(
        `\n✅ Ajv draft-07 verification PASSED: all ${matchedCount.toString()} fixtures match.\n`,
    );
}

runDifferentialVerification();
