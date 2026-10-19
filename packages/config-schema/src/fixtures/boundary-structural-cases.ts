import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalSection,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const boundaryStructuralCases: readonly FixtureCase[] = [
    {
        slug: 'boundary-steps-20-valid',
        name: 'Steps Boundary: Exactly 20 Steps (Valid)',
        description: 'Wizard config with exactly 20 steps, the maximum allowed',
        input: makeMinimalWizard(
            Array.from({ length: 20 }, (_, i) =>
                makeMinimalStep(`step_${i.toString()}`, [
                    makeMinimalField(`f_step_${i.toString()}`),
                ]),
            ),
        ),
        structural: 'valid',
    },
    {
        slug: 'boundary-steps-21-invalid',
        name: 'Steps Boundary: 21 Steps (Invalid Exceeded)',
        description: 'Wizard config with 21 steps, exceeding MAX_STEPS (20)',
        input: makeMinimalWizard(
            Array.from({ length: 21 }, (_, i) =>
                makeMinimalStep(`step_${i.toString()}`, [
                    makeMinimalField(`f_step_${i.toString()}`),
                ]),
            ),
        ),
        structural: 'invalid',
    },
    {
        slug: 'boundary-sections-20-valid',
        name: 'Sections Boundary: Exactly 20 Sections in Step (Valid)',
        description:
            'Step with exactly 20 sections, the maximum allowed per step',
        input: makeMinimalWizard([
            makeMinimalStep(
                'step_sec_20',
                Array.from({ length: 20 }, (_, i) =>
                    makeMinimalSection(`sec_${i.toString()}`, [
                        makeMinimalField(`f_s_${i.toString()}`),
                    ]),
                ),
            ),
        ]),
        structural: 'valid',
    },
    {
        slug: 'boundary-sections-21-invalid',
        name: 'Sections Boundary: 21 Sections in Step (Invalid Exceeded)',
        description:
            'Step with 21 sections, exceeding MAX_SECTIONS_PER_STEP (20)',
        input: makeMinimalWizard([
            makeMinimalStep(
                'step_sec_21',
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
        slug: 'boundary-fields-150-valid',
        name: 'Fields Total Boundary: Exactly 150 Fields (Valid)',
        description: 'Wizard containing exactly 150 fields in a single section',
        input: makeMinimalWizard([
            makeMinimalStep('step_f150', [
                makeMinimalSection(
                    'sec_f150',
                    Array.from({ length: 150 }, (_, i) =>
                        makeMinimalField(`f_${i.toString()}`),
                    ),
                ),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'boundary-fields-151-invalid',
        name: 'Fields Total Boundary: 151 Fields (Invalid Exceeded)',
        description:
            'Section containing 151 fields, exceeding MAX_FIELDS_TOTAL (150)',
        input: makeMinimalWizard([
            makeMinimalStep('step_f151', [
                makeMinimalSection(
                    'sec_f151',
                    Array.from({ length: 151 }, (_, i) =>
                        makeMinimalField(`f_${i.toString()}`),
                    ),
                ),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'boundary-options-60-valid',
        name: 'Options Boundary: Exactly 60 Options (Valid)',
        description:
            'Select field with exactly 60 options, the maximum allowed',
        input: makeMinimalWizard([
            makeMinimalStep('step_opt60', [
                makeMinimalField('field_opt60', {
                    type: 'select',
                    options: Array.from({ length: 60 }, (_, i) => ({
                        value: `opt_${i.toString()}`,
                        label: { ja: `選択肢 ${i.toString()}` },
                    })),
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'boundary-options-61-invalid',
        name: 'Options Boundary: 61 Options (Invalid Exceeded)',
        description:
            'Select field with 61 options, exceeding MAX_OPTIONS_PER_FIELD (60)',
        input: makeMinimalWizard([
            makeMinimalStep('step_opt61', [
                makeMinimalField('field_opt61', {
                    type: 'select',
                    options: Array.from({ length: 61 }, (_, i) => ({
                        value: `opt_${i.toString()}`,
                        label: { ja: `選択肢 ${i.toString()}` },
                    })),
                }),
            ]),
        ]),
        structural: 'invalid',
    },
];
