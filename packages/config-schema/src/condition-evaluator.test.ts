import { describe, expect, it } from 'vitest';
import {
    evaluateCondition,
    evaluateConditionSafe,
} from './condition-evaluator.js';
import { normalizeAnswer } from './answer-normalize.js';
import { type Condition } from './condition-types.js';

describe('Condition Evaluator - Strict Equality Matrix', () => {
    it('evaluates equality strictly without coercion', () => {
        expect(evaluateCondition({ '==': [1, '1'] }, {})).toBe(false);
        expect(evaluateCondition({ '==': [true, 1] }, {})).toBe(false);
        expect(evaluateCondition({ '==': [0, false] }, {})).toBe(false);
        expect(evaluateCondition({ '==': ['', null] }, {})).toBe(false);
        expect(
            evaluateCondition({ '==': [null, { var: 'missing' }] }, {}),
        ).toBe(true);
        expect(evaluateCondition({ '!=': [1, '1'] }, {})).toBe(true);
        expect(evaluateCondition({ '!=': [true, 1] }, {})).toBe(true);
        expect(evaluateCondition({ '!=': [0, false] }, {})).toBe(true);
        expect(evaluateCondition({ '!=': ['', null] }, {})).toBe(true);
        expect(
            evaluateCondition({ '!=': [null, { var: 'missing' }] }, {}),
        ).toBe(false);
    });

    it('compares arrays element by element strictly in order', () => {
        const answers = {
            arr1: ['a', 'b'],
            arr2: ['a', 'b'],
            arr3: ['b', 'a'],
            arr4: ['a'],
        };
        expect(
            evaluateCondition(
                { '==': [{ var: 'arr1' }, { var: 'arr2' }] },
                answers,
            ),
        ).toBe(true);
        expect(
            evaluateCondition(
                { '==': [{ var: 'arr1' }, { var: 'arr3' }] },
                answers,
            ),
        ).toBe(false);
        expect(
            evaluateCondition(
                { '==': [{ var: 'arr1' }, { var: 'arr4' }] },
                answers,
            ),
        ).toBe(false);
        expect(
            evaluateCondition(
                { '!=': [{ var: 'arr1' }, { var: 'arr3' }] },
                answers,
            ),
        ).toBe(true);
        expect(
            evaluateCondition({ '==': [{ var: 'arr1' }, 'a'] }, answers),
        ).toBe(false);
    });
});

describe('Condition Evaluator - Relational Comparisons (<, <=, >, >=)', () => {
    it('compares finite numbers correctly', () => {
        expect(evaluateCondition({ '<': [5, 10] }, {})).toBe(true);
        expect(evaluateCondition({ '<': [10, 5] }, {})).toBe(false);
        expect(evaluateCondition({ '<=': [5, 5] }, {})).toBe(true);
        expect(evaluateCondition({ '<=': [6, 5] }, {})).toBe(false);
        expect(evaluateCondition({ '>': [10, 5] }, {})).toBe(true);
        expect(evaluateCondition({ '>': [5, 10] }, {})).toBe(false);
        expect(evaluateCondition({ '>=': [5, 5] }, {})).toBe(true);
        expect(evaluateCondition({ '>=': [4, 5] }, {})).toBe(false);
    });

    it('returns false when either operand is a string, boolean, null, or array', () => {
        expect(evaluateCondition({ '<': ['5', 10] }, {})).toBe(false);
        expect(evaluateCondition({ '<': ['a', 'b'] }, {})).toBe(false);
        expect(evaluateCondition({ '<=': ['5', '5'] }, {})).toBe(false);
        expect(evaluateCondition({ '<=': [null, 0] }, {})).toBe(false);
        expect(evaluateCondition({ '>': [10, '5'] }, {})).toBe(false);
        expect(evaluateCondition({ '>=': [true, 1] }, {})).toBe(false);
        expect(evaluateCondition({ '<': [{ var: 'missing' }, 10] }, {})).toBe(
            false,
        );
    });

    it('returns false for NaN and Infinity', () => {
        const answers = {
            notANumber: NaN,
            infinite: Infinity,
        };
        expect(
            evaluateCondition({ '<': [{ var: 'notANumber' }, 10] }, answers),
        ).toBe(false);
        expect(
            evaluateCondition({ '>': [{ var: 'infinite' }, 0] }, answers),
        ).toBe(false);
    });
});

describe('Condition Evaluator - In Operator', () => {
    it('matches needle in array literal and string[] var', () => {
        const answers = {
            features: ['pantry', 'laundry'],
            floors: 'two_story',
        };
        expect(
            evaluateCondition({ in: ['pantry', { var: 'features' }] }, answers),
        ).toBe(true);
        expect(
            evaluateCondition({ in: ['garage', { var: 'features' }] }, answers),
        ).toBe(false);
        expect(
            evaluateCondition(
                { in: [{ var: 'floors' }, ['single_story', 'two_story']] },
                answers,
            ),
        ).toBe(true);
        expect(
            evaluateCondition(
                { in: [{ var: 'floors' }, ['three_story']] },
                answers,
            ),
        ).toBe(false);
    });

    it('returns false for scalar var, missing var, and string haystack (no substring)', () => {
        const answers = { text: 'hello world', num: 42 };
        expect(
            evaluateCondition({ in: ['hello', { var: 'text' }] }, answers),
        ).toBe(false);
        expect(evaluateCondition({ in: ['h', { var: 'text' }] }, answers)).toBe(
            false,
        );
        expect(evaluateCondition({ in: [42, { var: 'num' }] }, answers)).toBe(
            false,
        );
        expect(
            evaluateCondition({ in: ['item', { var: 'missing' }] }, answers),
        ).toBe(false);
    });
});

describe('Condition Evaluator - Truthiness and Logic Operators', () => {
    it('evaluates and, or, ! over strict truthiness', () => {
        expect(evaluateCondition({ and: [true, 1, 'ok'] }, {})).toBe(true);
        expect(evaluateCondition({ and: [true, 0, 'ok'] }, {})).toBe(false);
        expect(evaluateCondition({ and: [true, '', 'ok'] }, {})).toBe(false);
        expect(evaluateCondition({ and: [true, null] }, {})).toBe(false);
        expect(evaluateCondition({ or: [false, 0, 'yes'] }, {})).toBe(true);
        expect(
            evaluateCondition(
                { or: [false, 0, '', null, { var: 'empty_arr' }] },
                { empty_arr: [] },
            ),
        ).toBe(false);
        expect(evaluateCondition({ '!': [false] }, {})).toBe(true);
        expect(evaluateCondition({ '!': [0] }, {})).toBe(true);
        expect(evaluateCondition({ '!': [''] }, {})).toBe(true);
        expect(evaluateCondition({ '!': [null] }, {})).toBe(true);
        expect(evaluateCondition({ '!': [true] }, {})).toBe(false);
        expect(evaluateCondition({ '!': [1] }, {})).toBe(false);
        expect(evaluateCondition({ '!': ['abc'] }, {})).toBe(false);
    });

    it('coerces top-level literal and var conditions by truthiness', () => {
        expect(evaluateCondition(true, {})).toBe(true);
        expect(evaluateCondition(false, {})).toBe(false);
        expect(evaluateCondition(1, {})).toBe(true);
        expect(evaluateCondition(0, {})).toBe(false);
        expect(evaluateCondition('yes', {})).toBe(true);
        expect(evaluateCondition('', {})).toBe(false);
        expect(evaluateCondition(null, {})).toBe(false);
        expect(evaluateCondition({ var: 'flag' }, { flag: true })).toBe(true);
        expect(evaluateCondition({ var: 'flag' }, { flag: false })).toBe(false);
        expect(evaluateCondition({ var: 'flag' }, { flag: 0 })).toBe(false);
        expect(evaluateCondition({ var: 'flag' }, { flag: '' })).toBe(false);
        expect(evaluateCondition({ var: 'flag' }, {})).toBe(false);
    });
});

describe('Condition Evaluator - Defensive Variable Resolution', () => {
    it('reads ONLY own properties and ignores inherited prototype keys', () => {
        const proto = { inheritedKey: 'should_not_read' };
        const answers: Record<string, unknown> = { ownKey: 'visible' };
        Object.setPrototypeOf(answers, proto);

        expect(
            evaluateCondition(
                { '==': [{ var: 'inheritedKey' }, 'should_not_read'] },
                answers,
            ),
        ).toBe(false);
        expect(
            evaluateCondition(
                { '==': [{ var: 'inheritedKey' }, null] },
                answers,
            ),
        ).toBe(true);
        expect(
            evaluateCondition(
                { '==': [{ var: 'ownKey' }, 'visible'] },
                answers,
            ),
        ).toBe(true);
        expect(
            evaluateCondition({ '==': [{ var: 'toString' }, null] }, {}),
        ).toBe(true);
        expect(
            evaluateCondition({ '==': [{ var: 'constructor' }, null] }, {}),
        ).toBe(true);
    });

    it('handles Object.create(null) and frozen answers', () => {
        const nullAnswers: Record<string, unknown> = { foo: 'bar' };
        Object.setPrototypeOf(nullAnswers, null);
        expect(
            evaluateCondition({ '==': [{ var: 'foo' }, 'bar'] }, nullAnswers),
        ).toBe(true);

        const frozenAnswers = Object.freeze({ count: 42 });
        expect(
            evaluateCondition({ '==': [{ var: 'count' }, 42] }, frozenAnswers),
        ).toBe(true);
    });

    it('safely yields null when getters or proxies throw', () => {
        const hostileObj: Record<string, unknown> = {};
        Object.defineProperty(hostileObj, 'exploding', {
            get: () => {
                throw new Error('Hostile getter triggered');
            },
            enumerable: true,
        });

        expect(
            evaluateCondition(
                { '==': [{ var: 'exploding' }, null] },
                hostileObj,
            ),
        ).toBe(true);

        const hostileProxy = new Proxy(
            {},
            {
                get: () => {
                    throw new Error('Hostile proxy triggered');
                },
                has: () => {
                    throw new Error('Hostile proxy has triggered');
                },
            },
        );
        expect(
            evaluateCondition({ '==': [{ var: 'any' }, null] }, hostileProxy),
        ).toBe(true);
    });

    it('guards recursion depth (<= 8) and node count (<= 80) defensively', () => {
        let deepCond: Condition = true;
        for (let i = 0; i < 10; i += 1) {
            deepCond = { and: [deepCond] };
        }
        expect(evaluateCondition(deepCond, {})).toBe(false);

        const wideNodes: Condition[] = [];
        for (let i = 0; i < 90; i += 1) {
            wideNodes.push(true);
        }
        const wideCond: Condition = { or: wideNodes };
        expect(evaluateCondition(wideCond, {})).toBe(false);
    });
});

describe('Condition Evaluator - normalizeAnswer', () => {
    it('normalizes customer answers strictly according to value rules', () => {
        expect(normalizeAnswer(undefined)).toBe(null);
        expect(normalizeAnswer(null)).toBe(null);
        expect(normalizeAnswer(true)).toBe(true);
        expect(normalizeAnswer(false)).toBe(false);
        expect(normalizeAnswer(123)).toBe(123);
        expect(normalizeAnswer(NaN)).toBe(null);
        expect(normalizeAnswer(Infinity)).toBe(null);
        expect(normalizeAnswer('hello')).toBe('hello');
        expect(normalizeAnswer('a'.repeat(2001))).toBe(null);
        expect(normalizeAnswer({ obj: true })).toBe(null);
        expect(normalizeAnswer(() => 1)).toBe(null);
        expect(normalizeAnswer(['a', 'b'])).toEqual(['a', 'b']);
        expect(normalizeAnswer(['a', 123])).toBe(null);
        expect(normalizeAnswer(new Array(101).fill('x'))).toBe(null);
    });
});

describe('Condition Evaluator - evaluateConditionSafe', () => {
    it('returns INVALID_CONDITION on invalid AST', () => {
        const unknownOp = { unknown_operator: [1, 2] };
        expect(evaluateConditionSafe(unknownOp, {})).toEqual({
            ok: false,
            reason: 'INVALID_CONDITION',
        });

        const twoKeys = { '==': [1, 1], and: [true] };
        expect(evaluateConditionSafe(twoKeys, {})).toEqual({
            ok: false,
            reason: 'INVALID_CONDITION',
        });
    });

    it('returns INVALID_ANSWERS when answers is not an object', () => {
        expect(evaluateConditionSafe(true, null)).toEqual({
            ok: false,
            reason: 'INVALID_ANSWERS',
        });
        expect(evaluateConditionSafe(true, undefined)).toEqual({
            ok: false,
            reason: 'INVALID_ANSWERS',
        });
        expect(evaluateConditionSafe(true, 123)).toEqual({
            ok: false,
            reason: 'INVALID_ANSWERS',
        });
        expect(evaluateConditionSafe(true, 'string')).toEqual({
            ok: false,
            reason: 'INVALID_ANSWERS',
        });
        expect(evaluateConditionSafe(true, true)).toEqual({
            ok: false,
            reason: 'INVALID_ANSWERS',
        });
        expect(evaluateConditionSafe(true, [1, 2])).toEqual({
            ok: false,
            reason: 'INVALID_ANSWERS',
        });
    });

    it('returns ok: true with evaluated boolean on valid inputs', () => {
        expect(evaluateConditionSafe(true, {})).toEqual({
            ok: true,
            value: true,
        });
        expect(
            evaluateConditionSafe(
                { '==': [{ var: 'floor_count' }, 'single_story'] },
                {
                    floor_count: 'single_story',
                },
            ),
        ).toEqual({
            ok: true,
            value: true,
        });
    });
});
