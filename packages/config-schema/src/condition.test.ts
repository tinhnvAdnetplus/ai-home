import { describe, expect, it } from 'vitest';
import {
    collectConditionVars,
    conditionSchema,
    parseCondition,
    type Condition,
} from './condition.js';

describe('conditionSchema', () => {
    it('accepts valid literals', () => {
        expect(conditionSchema.safeParse('hello').success).toBe(true);
        expect(conditionSchema.safeParse(42).success).toBe(true);
        expect(conditionSchema.safeParse(true).success).toBe(true);
        expect(conditionSchema.safeParse(null).success).toBe(true);
    });

    it('rejects NaN and Infinity literals', () => {
        expect(conditionSchema.safeParse(Number.NaN).success).toBe(false);
        expect(
            conditionSchema.safeParse(Number.POSITIVE_INFINITY).success,
        ).toBe(false);
        expect(
            conditionSchema.safeParse(Number.NEGATIVE_INFINITY).success,
        ).toBe(false);
    });

    it('accepts valid var node', () => {
        expect(conditionSchema.safeParse({ var: 'has_land' }).success).toBe(
            true,
        );
    });

    it('rejects forbidden or invalid var keys', () => {
        expect(conditionSchema.safeParse({ var: 'constructor' }).success).toBe(
            false,
        );
        expect(conditionSchema.safeParse({ var: '__proto__' }).success).toBe(
            false,
        );
        expect(conditionSchema.safeParse({ var: 'bad-key' }).success).toBe(
            false,
        );
        expect(
            conditionSchema.safeParse({ var: 'has_land', other: 1 }).success,
        ).toBe(false);
    });

    it('accepts every operator with valid arity', () => {
        expect(conditionSchema.safeParse({ and: [true, false] }).success).toBe(
            true,
        );
        expect(conditionSchema.safeParse({ or: [true] }).success).toBe(true);
        expect(conditionSchema.safeParse({ '!': [true] }).success).toBe(true);
        expect(
            conditionSchema.safeParse({ '==': [{ var: 'floors' }, 2] }).success,
        ).toBe(true);
        expect(
            conditionSchema.safeParse({ '!=': [{ var: 'floors' }, 1] }).success,
        ).toBe(true);
        expect(
            conditionSchema.safeParse({ '<': [{ var: 'age' }, 65] }).success,
        ).toBe(true);
        expect(
            conditionSchema.safeParse({ '<=': [{ var: 'age' }, 65] }).success,
        ).toBe(true);
        expect(
            conditionSchema.safeParse({ '>': [{ var: 'area' }, 30] }).success,
        ).toBe(true);
        expect(
            conditionSchema.safeParse({ '>=': [{ var: 'area' }, 30] }).success,
        ).toBe(true);
        expect(
            conditionSchema.safeParse({
                in: [{ var: 'city' }, ['tokyo', 'osaka']],
            }).success,
        ).toBe(true);
        expect(
            conditionSchema.safeParse({
                in: [{ var: 'city' }, { var: 'allowed_cities' }],
            }).success,
        ).toBe(true);
    });

    it('rejects operators with wrong arity', () => {
        // and/or: 1..10
        expect(conditionSchema.safeParse({ and: [] }).success).toBe(false);
        expect(
            conditionSchema.safeParse({
                and: new Array<boolean>(11).fill(true),
            }).success,
        ).toBe(false);
        expect(conditionSchema.safeParse({ or: [] }).success).toBe(false);
        expect(
            conditionSchema.safeParse({ or: new Array<boolean>(11).fill(true) })
                .success,
        ).toBe(false);

        // !: exactly 1
        expect(conditionSchema.safeParse({ '!': [] }).success).toBe(false);
        expect(conditionSchema.safeParse({ '!': [true, false] }).success).toBe(
            false,
        );

        // comparisons: exactly 2
        expect(conditionSchema.safeParse({ '==': [1] }).success).toBe(false);
        expect(conditionSchema.safeParse({ '==': [1, 2, 3] }).success).toBe(
            false,
        );
        expect(conditionSchema.safeParse({ '<': [1] }).success).toBe(false);
        expect(conditionSchema.safeParse({ '<': [1, 2, 3] }).success).toBe(
            false,
        );

        // in: exactly 2
        expect(conditionSchema.safeParse({ in: ['a'] }).success).toBe(false);
        expect(
            conditionSchema.safeParse({ in: ['a', ['b'], 'c'] }).success,
        ).toBe(false);
    });

    it('rejects unknown operators and objects with several keys', () => {
        expect(conditionSchema.safeParse({ xor: [true, false] }).success).toBe(
            false,
        );
        expect(
            conditionSchema.safeParse({ and: [true], or: [false] }).success,
        ).toBe(false);
        expect(
            conditionSchema.safeParse({ '==': [1, 2], var: 'test' }).success,
        ).toBe(false);
    });

    it('rejects nested arrays elsewhere', () => {
        expect(conditionSchema.safeParse([[1]]).success).toBe(false);
        expect(conditionSchema.safeParse({ and: [[1, 2]] }).success).toBe(
            false,
        );
        expect(conditionSchema.safeParse({ '==': [[1], 2] }).success).toBe(
            false,
        );
    });

    it('enforces in scalar array max length 50', () => {
        const fiftyItems = new Array<string>(50).fill('item');
        expect(
            conditionSchema.safeParse({ in: [{ var: 'kind' }, fiftyItems] })
                .success,
        ).toBe(true);

        const fiftyOneItems = new Array<string>(51).fill('item');
        expect(
            conditionSchema.safeParse({ in: [{ var: 'kind' }, fiftyOneItems] })
                .success,
        ).toBe(false);
    });

    it('enforces condition depth limit <= 6', () => {
        // Depth 6: 5 nested ! operators on literal true
        const depth6: Condition = {
            '!': [{ '!': [{ '!': [{ '!': [{ '!': [true] }] }] }] }],
        };
        expect(conditionSchema.safeParse(depth6).success).toBe(true);

        // Depth 7: 6 nested ! operators on literal true
        const depth7: Condition = {
            '!': [{ '!': [{ '!': [{ '!': [{ '!': [{ '!': [true] }] }] }] }] }],
        };
        expect(conditionSchema.safeParse(depth7).success).toBe(false);
    });

    it('enforces total nodes limit <= 60', () => {
        const child10Nodes: Condition = { and: [1, 2, 3, 4, 5, 6, 7, 8, 9] }; // 10 nodes (1 op + 9 leaves)
        const child9Nodes: Condition = { and: [1, 2, 3, 4, 5, 6, 7, 8] }; // 9 nodes (1 op + 8 leaves)

        // 60 nodes: 1 (root) + 5 * 10 (50) + 9 = 60 nodes, 6 operands
        const node60: Condition = {
            and: [
                child10Nodes,
                child10Nodes,
                child10Nodes,
                child10Nodes,
                child10Nodes,
                child9Nodes,
            ],
        };
        expect(conditionSchema.safeParse(node60).success).toBe(true);

        // 61 nodes: 1 (root) + 6 * 10 (60) = 61 nodes, 6 operands
        const node61: Condition = {
            and: [
                child10Nodes,
                child10Nodes,
                child10Nodes,
                child10Nodes,
                child10Nodes,
                child10Nodes,
            ],
        };
        expect(conditionSchema.safeParse(node61).success).toBe(false);
    });

    it('parseCondition throws on invalid and returns condition on valid', () => {
        expect(() => parseCondition({ bad: 1 })).toThrow();
        const valid = parseCondition({ '==': [{ var: 'status' }, 'active'] });
        expect(valid).toEqual({ '==': [{ var: 'status' }, 'active'] });
    });

    it('collectConditionVars returns de-duplicated sorted vars', () => {
        const cond: Condition = {
            and: [
                { '==': [{ var: 'zebra' }, 1] },
                { '==': [{ var: 'apple' }, 2] },
                {
                    or: [
                        { '==': [{ var: 'banana' }, 3] },
                        { '==': [{ var: 'apple' }, 4] },
                    ],
                },
            ],
        };
        const vars = collectConditionVars(cond);
        expect(vars).toEqual(['apple', 'banana', 'zebra']);
    });
});
