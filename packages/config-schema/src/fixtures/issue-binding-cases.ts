import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const issueBindingCases: readonly FixtureCase[] = [
    {
        slug: 'unknown-binding-key',
        name: 'Unknown Planner Capability Binding Key',
        description:
            'Field specifies a binding key not present in the planner binding registry',
        input: makeMinimalWizard([
            makeMinimalStep('step_unk_bind', [
                makeMinimalField('field_unk_bind', {
                    binding: 'custom.unsupportedKey',
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'binding-type-mismatch-text-for-number',
        name: 'Binding Type Mismatch: Text Field on Number Binding',
        description: 'Text field bound to site.frontage which expects number',
        input: makeMinimalWizard([
            makeMinimalStep('step_bind_mismatch', [
                makeMinimalField('field_mismatch_1', {
                    type: 'text',
                    binding: 'site.frontage',
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'binding-type-mismatch-number-for-array',
        name: 'Binding Type Mismatch: Number Field on String Array Binding',
        description:
            'Number field bound to rooms.roomTypes which expects string array',
        input: makeMinimalWizard([
            makeMinimalStep('step_bind_mismatch_2', [
                makeMinimalField('field_mismatch_2', {
                    type: 'number',
                    binding: 'rooms.roomTypes',
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'duplicate-binding-key',
        name: 'Duplicate Planner Capability Binding',
        description:
            'Multiple fields in the wizard cannot map to the identical planner binding key',
        input: makeMinimalWizard([
            makeMinimalStep('step_dup_bind', [
                makeMinimalField('field_bind_1', {
                    type: 'number',
                    binding: 'site.frontage',
                }),
                makeMinimalField('field_bind_2', {
                    type: 'number',
                    binding: 'site.frontage',
                }),
            ]),
        ]),
        structural: 'valid',
    },
];
