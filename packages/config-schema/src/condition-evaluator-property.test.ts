import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { evaluateCondition } from './condition-evaluator.js';
import { type Condition, type VarNode } from './condition-types.js';

function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function deepFreeze<T>(val: T): T {
    if (val === null || typeof val !== 'object') {
        return val;
    }
    Object.freeze(val);
    if (Array.isArray(val)) {
        for (const item of val) {
            deepFreeze(item);
        }
    } else if (isRecord(val)) {
        for (const child of Object.values(val)) {
            deepFreeze(child);
        }
    }
    return val;
}

const varKeys = [
    'x',
    'y',
    'z',
    'status',
    'features',
    'count',
    'is_active',
] as const;
const varNodeArb: fc.Arbitrary<VarNode> = fc
    .constantFrom(...varKeys)
    .map((k) => ({ var: k }));

const conditionTreeArb: fc.Arbitrary<Condition> = fc.letrec<{
    leaf: Condition;
    tree: Condition;
}>((tie) => ({
    leaf: fc.oneof(
        fc.boolean(),
        fc.integer({ min: -100, max: 100 }),
        fc.string({ maxLength: 20 }),
        fc.constant(null),
        varNodeArb,
    ),
    tree: fc.oneof(
        { depthSize: 'small', maxDepth: 4 },
        tie('leaf'),
        fc.record({ '!': fc.tuple(tie('tree')) }),
        fc.record({ '==': fc.tuple(tie('tree'), tie('tree')) }),
        fc.record({ '!=': fc.tuple(tie('tree'), tie('tree')) }),
        fc.record({ '<': fc.tuple(tie('tree'), tie('tree')) }),
        fc.record({ '<=': fc.tuple(tie('tree'), tie('tree')) }),
        fc.record({ '>': fc.tuple(tie('tree'), tie('tree')) }),
        fc.record({ '>=': fc.tuple(tie('tree'), tie('tree')) }),
        fc.record({
            and: fc.array(tie('tree'), { minLength: 1, maxLength: 3 }),
        }),
        fc.record({
            or: fc.array(tie('tree'), { minLength: 1, maxLength: 3 }),
        }),
        fc.record({
            in: fc.tuple(
                tie('tree'),
                fc.oneof(
                    varNodeArb,
                    fc.array(
                        fc.oneof(
                            fc.string({ maxLength: 10 }),
                            fc.integer({ min: -10, max: 10 }),
                            fc.boolean(),
                            fc.constant(null),
                        ),
                        { maxLength: 5 },
                    ),
                ),
            ),
        }),
    ),
})).tree;

const answersArb: fc.Arbitrary<Record<string, unknown>> = fc.dictionary(
    fc.constantFrom(...varKeys, 'extra_key', 'nested'),
    fc.oneof(
        fc.string({ maxLength: 30 }),
        fc.integer(),
        fc.boolean(),
        fc.constant(null),
        fc.constant(undefined),
        fc.array(fc.string({ maxLength: 10 }), { maxLength: 4 }),
        fc.record({ nestedProp: fc.string() }),
    ),
);

describe('Condition Evaluator - Property-Based Tests (fast-check >= 200 runs)', () => {
    it('never throws and returns deterministic boolean for arbitrary valid conditions and answers', () => {
        fc.assert(
            fc.property(conditionTreeArb, answersArb, (condition, answers) => {
                const frozenAnswers = deepFreeze(structuredClone(answers));
                const isResult1 = evaluateCondition(condition, frozenAnswers);
                const isResult2 = evaluateCondition(condition, frozenAnswers);

                expect(typeof isResult1).toBe('boolean');
                expect(isResult1).toBe(isResult2);
            }),
            { numRuns: 250 },
        );
    });

    it('satisfies !evaluate(c) === evaluate(!c)', () => {
        fc.assert(
            fc.property(conditionTreeArb, answersArb, (condition, answers) => {
                const notCondition: Condition = { '!': [condition] };
                const isDirect = evaluateCondition(condition, answers);
                const isNegated = evaluateCondition(notCondition, answers);

                expect(isNegated).toBe(!isDirect);
            }),
            { numRuns: 250 },
        );
    });

    it('satisfies De Morgan law: evaluate(!(a and b)) === evaluate(!a or !b)', () => {
        fc.assert(
            fc.property(
                conditionTreeArb,
                conditionTreeArb,
                answersArb,
                (condA, condB, answers) => {
                    const notAndCond: Condition = {
                        '!': [{ and: [condA, condB] }],
                    };
                    const orNotCond: Condition = {
                        or: [{ '!': [condA] }, { '!': [condB] }],
                    };

                    const isLeft = evaluateCondition(notAndCond, answers);
                    const isRight = evaluateCondition(orNotCond, answers);

                    expect(isLeft).toBe(isRight);
                },
            ),
            { numRuns: 250 },
        );
    });

    it('satisfies Commutative law: evaluate(a or b) === evaluate(b or a)', () => {
        fc.assert(
            fc.property(
                conditionTreeArb,
                conditionTreeArb,
                answersArb,
                (condA, condB, answers) => {
                    const orAB: Condition = { or: [condA, condB] };
                    const orBA: Condition = { or: [condB, condA] };

                    const isResultAB = evaluateCondition(orAB, answers);
                    const isResultBA = evaluateCondition(orBA, answers);

                    expect(isResultAB).toBe(isResultBA);
                },
            ),
            { numRuns: 250 },
        );
    });

    it('leaves answers object untouched during evaluation', () => {
        fc.assert(
            fc.property(conditionTreeArb, answersArb, (condition, answers) => {
                const snapshot = structuredClone(answers);
                const frozen = deepFreeze(answers);
                evaluateCondition(condition, frozen);
                expect(frozen).toEqual(snapshot);
            }),
            { numRuns: 200 },
        );
    });
});
