import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const boundaryTextCases: readonly FixtureCase[] = [
    {
        slug: 'boundary-ja-text-500-valid',
        name: 'Localized Text Boundary: Exactly 500 Chars (Valid)',
        description: 'Japanese label text with exactly 500 characters',
        input: makeMinimalWizard([
            makeMinimalStep('step_ja500', [
                makeMinimalField('field_ja500', {
                    label: { ja: '家'.repeat(500) },
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'boundary-ja-text-501-invalid',
        name: 'Localized Text Boundary: 501 Chars (Invalid Exceeded)',
        description:
            'Japanese label text with 501 characters, exceeding max 500',
        input: makeMinimalWizard([
            makeMinimalStep('step_ja501', [
                makeMinimalField('field_ja501', {
                    label: { ja: '家'.repeat(501) },
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'boundary-key-length-48-valid',
        name: 'Key Length Boundary: Exactly 48 Chars (Valid)',
        description: 'Field key with exactly 48 valid characters',
        input: makeMinimalWizard([
            makeMinimalStep('step_k48', [makeMinimalField('k'.repeat(48))]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'boundary-key-length-49-invalid',
        name: 'Key Length Boundary: 49 Chars (Invalid Exceeded)',
        description:
            'Field key with 49 characters, exceeding maximum length 48',
        input: makeMinimalWizard([
            makeMinimalStep('step_k49', [makeMinimalField('k'.repeat(49))]),
        ]),
        structural: 'invalid',
    },
];
