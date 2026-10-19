import fs from 'node:fs';
import path from 'node:path';
import { parseWizardConfig } from '../wizard/validate.js';
import { ISSUE_CODES } from '../wizard/issue-codes.js';
import { allFixtureCases, validateFixtureCorpusIntegrity } from './index.js';
import { FIXTURES_DIR } from '../paths.js';
import { serializeDeterministic } from '../json-schema/deterministic.js';
import { type FixtureFileContent } from './types.js';

export function checkAllFixtures(): void {
    validateFixtureCorpusIntegrity();

    if (!fs.existsSync(FIXTURES_DIR)) {
        process.stderr.write(`Fixtures directory missing: ${FIXTURES_DIR}\n`);
        process.exit(1);
    }

    const files = fs
        .readdirSync(FIXTURES_DIR)
        .filter((f) => f.endsWith('.json'))
        .sort();

    if (files.length !== allFixtureCases.length) {
        process.stderr.write(
            `Fixture count mismatch: on disk ${files.length.toString()} vs source ${allFixtureCases.length.toString()}\n`,
        );
        process.exit(1);
    }

    let totalBytes = 0;
    const coveredIssueCodes = new Set<string>();

    for (let i = 0; i < allFixtureCases.length; i++) {
        const item = allFixtureCases[i];
        if (!item) continue;
        const num = String(i + 1).padStart(2, '0');
        const filename = `${num}-${item.slug}.json`;
        const filePath = path.join(FIXTURES_DIR, filename);

        if (!fs.existsSync(filePath)) {
            process.stderr.write(
                `Expected fixture file missing: ${filePath}\n`,
            );
            process.exit(1);
        }

        const existingRaw = fs.readFileSync(filePath, 'utf8');
        totalBytes += existingRaw.length;

        const parseResult = parseWizardConfig(item.input);
        const codes = parseResult.ok
            ? []
            : Array.from(
                  new Set(parseResult.issues.map((iss) => iss.code)),
              ).sort();

        for (const code of codes) {
            coveredIssueCodes.add(code);
        }

        const firstPath =
            !parseResult.ok && parseResult.issues[0]?.path
                ? [...parseResult.issues[0].path]
                : undefined;

        const expectedContentObj: FixtureFileContent = {
            name: item.name,
            description: item.description,
            input: item.input,
            expected: {
                ok: parseResult.ok,
                codes,
                ...(firstPath ? { firstPath } : {}),
            },
            structural: item.structural,
            ...(item.knownDivergence
                ? { knownDivergence: item.knownDivergence }
                : {}),
        };

        const freshSerialized = serializeDeterministic(expectedContentObj);
        if (existingRaw !== freshSerialized) {
            process.stderr.write(
                `Fixture file out of date: ${filePath}\nRun 'pnpm fixtures:generate' to regenerate.\n`,
            );
            process.exit(1);
        }
    }

    const maxSizeBytes = 2 * 1024 * 1024;
    if (totalBytes >= maxSizeBytes) {
        process.stderr.write(
            `Total fixture corpus size ${totalBytes.toString()} bytes exceeds 2 MB limit\n`,
        );
        process.exit(1);
    }

    // Verify all 14 issue codes are covered
    const missingCodes = ISSUE_CODES.filter((c) => !coveredIssueCodes.has(c));
    if (missingCodes.length > 0) {
        process.stderr.write(
            `Fixture corpus does not cover all issue codes. Missing: ${missingCodes.join(', ')}\n`,
        );
        process.exit(1);
    }

    process.stdout.write(
        `Fixtures verified: ${allFixtureCases.length.toString()} cases (${totalBytes.toString()} bytes). All 14 issue codes covered.\n`,
    );
}

checkAllFixtures();
