import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const issueRefCases: readonly FixtureCase[] = [
    {
        slug: 'unknown-field-ref-visible',
        name: 'Condition References Unknown Field in visibleWhen',
        description:
            'visibleWhen references a field key not present anywhere in the wizard',
        input: makeMinimalWizard([
            makeMinimalStep('step_unknown_ref', [
                makeMinimalField('field_target', {
                    visibleWhen: { var: 'non_existent_field_key' },
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'unknown-field-ref-disabled',
        name: 'Condition References Unknown Field in disabledWhen',
        description: 'disabledWhen references an unknown field key',
        input: makeMinimalWizard([
            makeMinimalStep('step_unknown_dis', [
                makeMinimalField('field_target_dis', {
                    disabledWhen: { var: 'ghost_field_key' },
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'unknown-field-ref-option',
        name: 'Option disabledWhen References Unknown Field',
        description:
            'Option disabledWhen condition references an unresolvable field key',
        input: makeMinimalWizard([
            makeMinimalStep('step_unknown_opt_cond', [
                makeMinimalField('field_with_opt_cond', {
                    type: 'radio',
                    options: [
                        {
                            value: 'opt_1',
                            label: { ja: '選択肢1' },
                            disabledWhen: { var: 'missing_var' },
                        },
                    ],
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'self-reference-visible',
        name: 'Self-referencing Field Condition in visibleWhen',
        description:
            'A field cannot condition its own visibility on its own answer',
        input: makeMinimalWizard([
            makeMinimalStep('step_self_ref', [
                makeMinimalField('self_field_vis', {
                    visibleWhen: { var: 'self_field_vis' },
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'self-reference-disabled',
        name: 'Self-referencing Field Condition in disabledWhen',
        description:
            'A field cannot condition its disabled state on its own answer',
        input: makeMinimalWizard([
            makeMinimalStep('step_self_dis', [
                makeMinimalField('self_field_dis', {
                    disabledWhen: { var: 'self_field_dis' },
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'condition-cycle-2-cycle',
        name: 'Two-field Condition Dependency Cycle',
        description:
            'Field A depends on Field B, and Field B depends on Field A',
        input: makeMinimalWizard([
            makeMinimalStep('step_cycle_2', [
                makeMinimalField('field_a', {
                    visibleWhen: { var: 'field_b' },
                }),
                makeMinimalField('field_b', {
                    visibleWhen: { var: 'field_a' },
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'condition-cycle-3-cycle',
        name: 'Three-field Condition Dependency Cycle',
        description:
            'Field A -> Field B -> Field C -> Field A cyclic dependency',
        input: makeMinimalWizard([
            makeMinimalStep('step_cycle_3', [
                makeMinimalField('field_c1', {
                    visibleWhen: { var: 'field_c2' },
                }),
                makeMinimalField('field_c2', {
                    visibleWhen: { var: 'field_c3' },
                }),
                makeMinimalField('field_c3', {
                    visibleWhen: { var: 'field_c1' },
                }),
            ]),
        ]),
        structural: 'valid',
    },
];
