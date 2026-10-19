import { sampleWizard } from '../defaults/sample-wizard.js';
import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const validCases: readonly FixtureCase[] = [
    {
        slug: 'valid-sample-wizard',
        name: 'Valid Sample Wizard',
        description:
            'Complete canonical sample wizard with 2 steps and diverse field types',
        input: sampleWizard,
        structural: 'valid',
    },
    {
        slug: 'valid-empty-steps',
        name: 'Valid Empty Steps',
        description:
            'A minimal wizard with zero steps is structurally and semantically valid',
        input: { schemaVersion: 1, steps: [] },
        structural: 'valid',
    },
    {
        slug: 'valid-multilingual-text',
        name: 'Valid Multilingual Text with Emoji and Diacritics',
        description:
            'Wizard titles and labels with Japanese Kanji, English, Vietnamese accents, and emoji',
        input: makeMinimalWizard([
            makeMinimalStep('step_intl', [
                makeMinimalField('field_intl', {
                    label: {
                        ja: '家づくり希望 🏡',
                        en: 'Home building preferences 🏡',
                        vi: 'Nguyện vọng xây nhà đẹp 🏡',
                    },
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'valid-long-legal-string',
        name: 'Valid Long Legal String',
        description:
            'Text field defaultValue with exactly 500 valid characters',
        input: makeMinimalWizard([
            makeMinimalStep('step_long', [
                makeMinimalField('field_long', {
                    maxLength: 500,
                    defaultValue: 'あ'.repeat(500),
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'divergence-untrimmed-text-length',
        name: 'Untrimmed Localized Text Boundary',
        description:
            'Localized text with surrounding whitespace that trims to 500 chars but is 504 chars raw',
        input: makeMinimalWizard([
            makeMinimalStep('step_div', [
                makeMinimalField('field_div', {
                    label: {
                        ja: `  ${'あ'.repeat(500)}  `,
                    },
                }),
            ]),
        ]),
        structural: 'invalid',
        knownDivergence:
            'Zod trims strings before validating length; raw JSON Schema validates untrimmed length unless normalized by server trimming.',
    },
];
