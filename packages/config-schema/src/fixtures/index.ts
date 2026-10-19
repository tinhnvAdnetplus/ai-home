import { type FixtureCase } from './types.js';
import { validCases } from './valid-cases.js';
import { issueCases } from './issue-cases.js';
import { fieldTypeCases } from './field-type-cases.js';
import { boundaryCases } from './boundary-cases.js';
import { hostileCases } from './hostile-cases.js';

export * from './types.js';
export * from './helpers.js';

export const allFixtureCases: readonly FixtureCase[] = [
    ...validCases,
    ...issueCases,
    ...fieldTypeCases,
    ...boundaryCases,
    ...hostileCases,
];

export function validateFixtureCorpusIntegrity(): void {
    const slugs = new Set<string>();
    const serializedInputs = new Set<string>();

    for (const fixture of allFixtureCases) {
        if (slugs.has(fixture.slug)) {
            throw new Error(`Duplicate fixture slug detected: ${fixture.slug}`);
        }
        slugs.add(fixture.slug);

        const inputStr = JSON.stringify(fixture.input);
        if (serializedInputs.has(inputStr)) {
            throw new Error(
                `Duplicate fixture input detected in slug: ${fixture.slug}`,
            );
        }
        serializedInputs.add(inputStr);
    }
}
