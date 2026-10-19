import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

export const hostileProtoCases: readonly FixtureCase[] = [
    {
        slug: 'hostile-key-proto',
        name: 'Prototype Key Denial: __proto__',
        description: 'Deny-list rejects __proto__ as a step key',
        input: makeMinimalWizard([makeMinimalStep('__proto__')]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-key-constructor',
        name: 'Prototype Key Denial: constructor',
        description: 'Deny-list rejects constructor as a field key',
        input: makeMinimalWizard([
            makeMinimalStep('step_hostile_1', [
                makeMinimalField('constructor'),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-key-prototype',
        name: 'Prototype Key Denial: prototype',
        description: 'Deny-list rejects prototype as an option value',
        input: makeMinimalWizard([
            makeMinimalStep('step_hostile_2', [
                makeMinimalField('field_hostile_opt', {
                    type: 'select',
                    options: [
                        { value: 'prototype', label: { ja: 'プロトタイプ' } },
                    ],
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-var-proto',
        name: 'Prototype Var Denial in Condition: __proto__',
        description: 'Deny-list rejects __proto__ as variable in condition AST',
        input: makeMinimalWizard([
            makeMinimalStep('step_hostile_var_1', [
                makeMinimalField('field_v1', {
                    visibleWhen: { var: '__proto__' },
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-var-constructor',
        name: 'Prototype Var Denial in Condition: constructor',
        description:
            'Deny-list rejects constructor as variable in condition AST',
        input: makeMinimalWizard([
            makeMinimalStep('step_hostile_var_2', [
                makeMinimalField('field_v2', {
                    visibleWhen: { var: 'constructor' },
                }),
            ]),
        ]),
        structural: 'invalid',
    },
    {
        slug: 'hostile-var-prototype',
        name: 'Prototype Var Denial in Condition: prototype',
        description: 'Deny-list rejects prototype as variable in condition AST',
        input: makeMinimalWizard([
            makeMinimalStep('step_hostile_var_3', [
                makeMinimalField('field_v3', {
                    visibleWhen: { var: 'prototype' },
                }),
            ]),
        ]),
        structural: 'invalid',
    },
];
