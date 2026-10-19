import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const hostileInputCases: readonly FixtureCase[] = [
    {
        slug: 'hostile-key-uppercase',
        name: 'Uppercase Key Rejection',
        description:
            'Keys must consist strictly of lowercase letters, numbers, and underscores',
        input: makeMinimalWizard([makeMinimalStep('StepOne')]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-key-hyphen',
        name: 'Kebab-case Key Rejection',
        description: 'Hyphens are disallowed in keys',
        input: makeMinimalWizard([makeMinimalStep('step-one')]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-key-leading-digit',
        name: 'Leading Digit Key Rejection',
        description: 'Keys cannot begin with a number',
        input: makeMinimalWizard([makeMinimalStep('1step')]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-key-trailing-newline',
        name: 'Trailing Newline Key Rejection',
        description: 'Keys cannot contain a trailing newline character',
        input: makeMinimalWizard([makeMinimalStep('step_nl\n')]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-key-with-nul',
        name: 'NUL Byte Key Rejection',
        description: 'Keys cannot contain embedded or trailing NUL byte',
        input: makeMinimalWizard([makeMinimalStep('step_nul\0')]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-key-fullwidth-characters',
        name: 'Fullwidth Characters Key Rejection',
        description: 'Keys cannot contain Unicode fullwidth characters',
        input: makeMinimalWizard([makeMinimalStep('ｓｔｅｐ')]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-root-type-null',
        name: 'Null Root Type Rejection',
        description: 'Input value is null instead of wizard object',
        input: null,
        structural: 'invalid',
    },
    {
        slug: 'hostile-root-type-array',
        name: 'Array Root Type Rejection',
        description: 'Input value is array instead of wizard object',
        input: [],
        structural: 'invalid',
    },
    {
        slug: 'hostile-type-number-as-string',
        name: 'Number As String Rejection',
        description: 'Numeric property min provided as string',
        input: makeMinimalWizard([
            makeMinimalStep('step_num_str', [
                makeMinimalField('field_num_str', {
                    type: 'number',
                    min: '10',
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-type-nan-string',
        name: 'NaN String In Numeric Property Rejection',
        description: 'Numeric property min provided as NaN string',
        input: makeMinimalWizard([
            makeMinimalStep('step_nan_str', [
                makeMinimalField('field_nan_str', {
                    type: 'number',
                    min: 'NaN',
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-type-infinity-string',
        name: 'Infinity String In Numeric Property Rejection',
        description: 'Numeric property max provided as Infinity string',
        input: makeMinimalWizard([
            makeMinimalStep('step_inf_str', [
                makeMinimalField('field_inf_str', {
                    type: 'number',
                    max: 'Infinity',
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-extra-field-property',
        name: 'Unknown Extra Property In Field Object',
        description:
            'Field objects are strict and disallow unrecognized properties',
        input: makeMinimalWizard([
            makeMinimalStep('step_extra_prop', [
                makeMinimalField('field_extra_prop', {
                    maliciousPayload: true,
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-missing-section-fields',
        name: 'Section Missing Required Fields Array',
        description: 'Section object must contain fields array',
        input: {
            schemaVersion: 1,
            steps: [
                {
                    key: 'step_no_fields',
                    title: { ja: 'ステップタイトル' },
                    sections: [
                        {
                            key: 'sec_no_fields',
                            title: { ja: 'セクションタイトル' },
                        },
                    ],
                },
            ],
        },
        structural: 'invalid',
    },
];
