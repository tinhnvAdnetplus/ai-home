import fs from 'node:fs';
import path from 'node:path';
import { parseWizardConfig } from '../wizard/validate.js';
import { allFixtureCases, validateFixtureCorpusIntegrity } from './index.js';
import { FIXTURES_DIR } from '../paths.js';
import { serializeDeterministic } from '../json-schema/deterministic.js';
import { type FixtureFileContent } from './types.js';

export function generateAllFixtures(): void {
    validateFixtureCorpusIntegrity();
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });

    // Clean existing .json files in directory
    const existing = fs.readdirSync(FIXTURES_DIR);
    for (const f of existing) {
        if (f.endsWith('.json')) {
            fs.unlinkSync(path.join(FIXTURES_DIR, f));
        }
    }

    for (let i = 0; i < allFixtureCases.length; i++) {
        const item = allFixtureCases[i];
        if (!item) continue;
        const num = String(i + 1).padStart(2, '0');
        const filename = `${num}-${item.slug}.json`;
        const filePath = path.join(FIXTURES_DIR, filename);

        const parseResult = parseWizardConfig(item.input);
        const codes = parseResult.ok
            ? []
            : Array.from(
                  new Set(parseResult.issues.map((iss) => iss.code)),
              ).sort();

        const firstPath =
            !parseResult.ok && parseResult.issues[0]?.path
                ? [...parseResult.issues[0].path]
                : undefined;

        const contentObj: FixtureFileContent = {
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

        const jsonStr = serializeDeterministic(contentObj);
        fs.writeFileSync(filePath, jsonStr, 'utf8');
    }

    process.stdout.write(
        `Generated ${allFixtureCases.length.toString()} fixtures in ${FIXTURES_DIR}\n`,
    );
}

generateAllFixtures();
