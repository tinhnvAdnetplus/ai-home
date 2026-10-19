import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const issueDefaultCases: readonly FixtureCase[] = [
    {
        slug: 'default-not-in-options-select',
        name: 'Select defaultValue Not In Options',
        description:
            'Single-select field specifies a defaultValue that is not one of its options',
        input: makeMinimalWizard([
            makeMinimalStep('step_def_opt', [
                makeMinimalField('field_def_sel', {
                    type: 'select',
                    options: [{ value: 'opt_valid', label: { ja: '有効' } }],
                    defaultValue: 'opt_missing',
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'default-not-in-options-checkbox',
        name: 'Checkbox Group defaultValue Contains Unrecognized Value',
        description:
            'Multi-select checkbox contains default value not present in available options',
        input: makeMinimalWizard([
            makeMinimalStep('step_def_chk', [
                makeMinimalField('field_def_chk', {
                    type: 'checkbox_group',
                    options: [{ value: 'opt_a', label: { ja: 'A' } }],
                    defaultValue: ['opt_a', 'opt_nonexistent'],
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'default-out-of-range-min',
        name: 'Number defaultValue Below Minimum',
        description: 'Numeric field defaultValue is strictly less than min',
        input: makeMinimalWizard([
            makeMinimalStep('step_def_min', [
                makeMinimalField('field_num_min', {
                    type: 'number',
                    min: 10,
                    max: 100,
                    defaultValue: 5,
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'default-out-of-range-max',
        name: 'Number defaultValue Above Maximum',
        description: 'Numeric field defaultValue is strictly greater than max',
        input: makeMinimalWizard([
            makeMinimalStep('step_def_max', [
                makeMinimalField('field_num_max', {
                    type: 'number',
                    min: 10,
                    max: 50,
                    defaultValue: 75,
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'range-invalid-min-gt-max',
        name: 'Numeric Range Invalid: Min Exceeds Max',
        description: 'Field min boundary is strictly greater than max boundary',
        input: makeMinimalWizard([
            makeMinimalStep('step_rng_inv', [
                makeMinimalField('field_rng_inv', {
                    type: 'range',
                    min: 100,
                    max: 20,
                    step: 5,
                }),
            ]),
        ]),
        structural: 'valid',
    },
];
