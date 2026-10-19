import { isStrictEqual, readVar } from './answer-normalize.js';

export function compareNumbers(
    left: unknown,
    right: unknown,
    op: '<' | '<=' | '>' | '>=',
): boolean {
    if (typeof left !== 'number' || !Number.isFinite(left)) {
        return false;
    }
    if (typeof right !== 'number' || !Number.isFinite(right)) {
        return false;
    }
    if (op === '<') {
        return left < right;
    }
    if (op === '<=') {
        return left <= right;
    }
    if (op === '>') {
        return left > right;
    }
    return left >= right;
}

export function evaluateBinaryOp(
    left: unknown,
    right: unknown,
    op: string,
): boolean {
    if (op === '==') {
        return isStrictEqual(left, right);
    }
    if (op === '!=') {
        return !isStrictEqual(left, right);
    }
    if (op === '<') {
        return compareNumbers(left, right, '<');
    }
    if (op === '<=') {
        return compareNumbers(left, right, '<=');
    }
    if (op === '>') {
        return compareNumbers(left, right, '>');
    }
    if (op === '>=') {
        return compareNumbers(left, right, '>=');
    }
    return false;
}

export function evalIn(
    needle: unknown,
    haystackNode: unknown,
    answers: Readonly<Record<string, unknown>>,
): boolean {
    if (
        typeof haystackNode === 'object' &&
        haystackNode !== null &&
        'var' in haystackNode &&
        typeof haystackNode.var === 'string'
    ) {
        const haystack = readVar(answers, haystackNode.var);
        if (!Array.isArray(haystack)) {
            return false;
        }
        for (const item of haystack) {
            if (item === needle) {
                return true;
            }
        }
        return false;
    }

    if (Array.isArray(haystackNode)) {
        for (const item of haystackNode) {
            if (item === needle) {
                return true;
            }
        }
        return false;
    }

    return false;
}
