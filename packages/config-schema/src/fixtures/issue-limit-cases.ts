import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalSection,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const issueLimitCases: readonly FixtureCase[] = [
    {
        slug: 'selection-limits-min-gt-max',
        name: 'Selection Limits Invalid: minSelected > maxSelected',
        description: 'minSelected cannot be strictly greater than maxSelected',
        input: makeMinimalWizard([
            makeMinimalStep('step_sel_inv', [
                makeMinimalField('field_sel_inv', {
                    type: 'checkbox_group',
                    options: [
                        { value: 'opt_1', label: { ja: '1' } },
                        { value: 'opt_2', label: { ja: '2' } },
                        { value: 'opt_3', label: { ja: '3' } },
                    ],
                    minSelected: 3,
                    maxSelected: 1,
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'selection-limits-exceed-options-count',
        name: 'Selection Limits Exceed Available Options',
        description:
            'maxSelected cannot exceed the total number of options defined',
        input: makeMinimalWizard([
            makeMinimalStep('step_sel_opt_count', [
                makeMinimalField('field_sel_opt_count', {
                    type: 'checkbox_group',
                    options: [{ value: 'opt_1', label: { ja: '1' } }],
                    maxSelected: 5,
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'empty-options-select',
        name: 'Select Field With Zero Options',
        description: 'A select field must define at least one option',
        input: makeMinimalWizard([
            makeMinimalStep('step_empty_opts', [
                makeMinimalField('field_empty_select', {
                    type: 'select',
                    options: [],
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'empty-options-radio',
        name: 'Radio Field With Zero Options',
        description: 'A radio field must define at least one option',
        input: makeMinimalWizard([
            makeMinimalStep('step_empty_radio', [
                makeMinimalField('field_empty_radio', {
                    type: 'radio',
                    options: [],
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'limit-exceeded-sections-per-step',
        name: 'Sections Count Exceeds Step Limit (21 sections)',
        description:
            'A single step contains 21 sections, exceeding MAX_SECTIONS_PER_STEP (20)',
        input: makeMinimalWizard([
            makeMinimalStep(
                'step_many_sec',
                Array.from({ length: 21 }, (_, i) =>
                    makeMinimalSection(`sec_${i.toString()}`, [
                        makeMinimalField(`f_s_${i.toString()}`),
                    ]),
                ),
            ),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'limit-exceeded-total-fields-across-sections',
        name: 'Total Fields Exceeds 150 Across Sections (151 fields)',
        description:
            'Wizard contains 151 fields across 2 sections (100 in sec_a, 51 in sec_b)',
        input: makeMinimalWizard([
            makeMinimalStep('step_field_limit', [
                makeMinimalSection(
                    'sec_a',
                    Array.from({ length: 100 }, (_, i) =>
                        makeMinimalField(`f_a_${i.toString()}`),
                    ),
                ),
                makeMinimalSection(
                    'sec_b',
                    Array.from({ length: 51 }, (_, i) =>
                        makeMinimalField(`f_b_${i.toString()}`),
                    ),
                ),
            ]),
        ]),
        structural: 'valid',
    },
];
