import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalSection,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const issueSchemaCases: readonly FixtureCase[] = [
    {
        slug: 'schema-invalid-version',
        name: 'Invalid Schema Version',
        description: 'schemaVersion must be the literal 1',
        input: { schemaVersion: 2, steps: [] },
        structural: 'invalid',
    },
    {
        slug: 'schema-invalid-steps-not-array',
        name: 'Steps Property Not An Array',
        description: 'steps must be an array of step objects',
        input: { schemaVersion: 1, steps: 'invalid_steps' },
        structural: 'invalid',
    },
    {
        slug: 'schema-invalid-missing-step-title',
        name: 'Step Missing Required Title',
        description: 'Step object must contain a localized title with Japanese',
        input: {
            schemaVersion: 1,
            steps: [{ key: 'step_no_title', sections: [] }],
        },
        structural: 'invalid',
    },
    {
        slug: 'schema-invalid-extra-root-property',
        name: 'Strict Object Disallows Extra Property',
        description:
            'Root wizard configuration cannot contain unrecognized properties',
        input: {
            schemaVersion: 1,
            steps: [],
            unexpectedField: 'forbidden',
        },
        structural: 'invalid',
    },
    {
        slug: 'schema-invalid-whitespace-only-title',
        name: 'Whitespace Only Japanese Text',
        description:
            'Localized Japanese text cannot consist solely of whitespace characters',
        input: makeMinimalWizard([
            makeMinimalStep('step_ws', [makeMinimalField('field_ws')], {
                title: { ja: '   ' },
            }),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'duplicate-key-steps',
        name: 'Duplicate Step Keys',
        description: 'Multiple steps share the identical key',
        input: makeMinimalWizard([
            makeMinimalStep('dup_step', [makeMinimalField('f1')]),
            makeMinimalStep('dup_step', [makeMinimalField('f2')]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'duplicate-key-sections',
        name: 'Duplicate Section Keys in Step',
        description:
            'Multiple sections within the same step share the identical key',
        input: makeMinimalWizard([
            makeMinimalStep('step_dup_sec', [
                makeMinimalSection('dup_sec', [makeMinimalField('f1')]),
                makeMinimalSection('dup_sec', [makeMinimalField('f2')]),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'duplicate-key-fields-same-section',
        name: 'Duplicate Field Keys in Same Section',
        description: 'Two fields in the same section have identical keys',
        input: makeMinimalWizard([
            makeMinimalStep('step_dup_fields', [
                makeMinimalField('dup_field'),
                makeMinimalField('dup_field'),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'duplicate-key-fields-across-steps',
        name: 'Duplicate Field Keys Across Steps',
        description:
            'Field keys must be globally unique across all steps of the wizard',
        input: makeMinimalWizard([
            makeMinimalStep('step_one', [makeMinimalField('shared_field_key')]),
            makeMinimalStep('step_two', [makeMinimalField('shared_field_key')]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'duplicate-key-options',
        name: 'Duplicate Option Values',
        description: 'Two options in a select field specify identical values',
        input: makeMinimalWizard([
            makeMinimalStep('step_dup_opt', [
                makeMinimalField('field_dup_opt', {
                    type: 'select',
                    options: [
                        { value: 'opt_dup', label: { ja: '選択肢 1' } },
                        { value: 'opt_dup', label: { ja: '選択肢 2' } },
                    ],
                }),
            ]),
        ]),
        structural: 'valid',
    },
];
