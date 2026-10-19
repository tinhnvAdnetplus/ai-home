import { type FixtureCase } from './types.js';
import {
    makeMinimalField,
    makeMinimalStep,
    makeMinimalWizard,
} from './helpers.js';

function buildDeepCondition(depth: number): Record<string, unknown> | boolean {
    if (depth <= 1) return true;
    return { '!': [buildDeepCondition(depth - 1)] };
}

function buildConditionWithNodes(totalNodes: number): Record<string, unknown> {
    const count = totalNodes === 60 ? 8 : 9;
    return {
        and: [
            { and: Array.from({ length: 9 }, () => true) },
            { and: Array.from({ length: 9 }, () => true) },
            { and: Array.from({ length: 9 }, () => true) },
            { and: Array.from({ length: 9 }, () => true) },
            { and: Array.from({ length: 9 }, () => true) },
            { and: Array.from({ length: count }, () => true) },
        ],
    };
}

export const boundaryConditionCases: readonly FixtureCase[] = [
    {
        slug: 'boundary-condition-depth-6-valid',
        name: 'Condition Depth Boundary: Exactly Depth 6 (Valid)',
        description: 'Condition AST with depth exactly 6',
        input: makeMinimalWizard([
            makeMinimalStep('step_cond_d6', [
                makeMinimalField('field_cond_d6', {
                    visibleWhen: buildDeepCondition(6),
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'boundary-condition-depth-7-invalid',
        name: 'Condition Depth Boundary: Depth 7 (Invalid Exceeded)',
        description:
            'Condition AST with depth 7, exceeding MAX_CONDITION_DEPTH (6)',
        input: makeMinimalWizard([
            makeMinimalStep('step_cond_d7', [
                makeMinimalField('field_cond_d7', {
                    visibleWhen: buildDeepCondition(7),
                }),
            ]),
        ]),
        structural: 'valid',
        knownDivergence:
            'JSON Schema draft-07 cannot enforce AST recursion depth; condition depth > 6 is rejected by Zod superRefine but structurally valid.',
    },
    {
        slug: 'boundary-condition-nodes-60-valid',
        name: 'Condition Nodes Boundary: Exactly 60 Nodes (Valid)',
        description:
            'Condition AST with exactly 60 total nodes, the maximum allowed',
        input: makeMinimalWizard([
            makeMinimalStep('step_cond_n60', [
                makeMinimalField('field_cond_n60', {
                    visibleWhen: buildConditionWithNodes(60),
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'boundary-condition-nodes-61-invalid',
        name: 'Condition Nodes Boundary: 61 Nodes (Invalid Exceeded)',
        description:
            'Condition AST with 61 total nodes, exceeding MAX_CONDITION_NODES (60)',
        input: makeMinimalWizard([
            makeMinimalStep('step_cond_n61', [
                makeMinimalField('field_cond_n61', {
                    visibleWhen: buildConditionWithNodes(61),
                }),
            ]),
        ]),
        structural: 'valid',
        knownDivergence:
            'JSON Schema draft-07 cannot count AST nodes; node count > 60 is rejected by Zod superRefine but structurally valid.',
    },
    {
        slug: 'boundary-in-list-50-valid',
        name: 'In Operator List Boundary: Exactly 50 Items (Valid)',
        description: 'In operator haystack array with exactly 50 scalar items',
        input: makeMinimalWizard([
            makeMinimalStep('step_in50', [
                makeMinimalField('target_f'),
                makeMinimalField('field_in50', {
                    visibleWhen: {
                        in: [
                            { var: 'target_f' },
                            Array.from(
                                { length: 50 },
                                (_, i) => `item_${i.toString()}`,
                            ),
                        ],
                    },
                }),
            ]),
        ]),
        structural: 'valid',
    },
    {
        slug: 'boundary-in-list-51-invalid',
        name: 'In Operator List Boundary: 51 Items (Invalid Exceeded)',
        description:
            'In operator haystack array with 51 items, exceeding max 50',
        input: makeMinimalWizard([
            makeMinimalStep('step_in51', [
                makeMinimalField('target_f'),
                makeMinimalField('field_in51', {
                    visibleWhen: {
                        in: [
                            { var: 'target_f' },
                            Array.from(
                                { length: 51 },
                                (_, i) => `item_${i.toString()}`,
                            ),
                        ],
                    },
                }),
            ]),
        ]),
        structural: 'invalid',
    },
];
