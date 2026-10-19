import { type AnswerValue } from './answer-types.js';

export function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function normalizeAnswer(value: unknown): AnswerValue {
    if (value === null || value === undefined) {
        return null;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
        return value.length <= 2000 ? value : null;
    }
    if (Array.isArray(value)) {
        try {
            if (value.length > 100) {
                return null;
            }
            const sanitizedItems: string[] = [];
            for (const item of value) {
                if (typeof item !== 'string' || item.length > 2000) {
                    return null;
                }
                sanitizedItems.push(item);
            }
            return sanitizedItems;
        } catch {
            return null;
        }
    }
    return null;
}

export function isTruthy(value: unknown): boolean {
    if (value === false || value === null || value === undefined) {
        return false;
    }
    if (typeof value === 'number') {
        return value !== 0 && Number.isFinite(value);
    }
    if (typeof value === 'string') {
        return value.length > 0;
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return true;
}

export function isStrictEqual(left: unknown, right: unknown): boolean {
    const isLeftArray = Array.isArray(left);
    const isRightArray = Array.isArray(right);

    if (isLeftArray && isRightArray) {
        if (left.length !== right.length) {
            return false;
        }
        for (let i = 0; i < left.length; i += 1) {
            if (left[i] !== right[i]) {
                return false;
            }
        }
        return true;
    }

    if (isLeftArray || isRightArray) {
        return false;
    }

    return left === right;
}

export function readVar(answers: unknown, key: string): AnswerValue {
    if (!isRecord(answers)) {
        return null;
    }
    try {
        if (!Object.hasOwn(answers, key)) {
            return null;
        }
        const rawValue = answers[key];
        return normalizeAnswer(rawValue);
    } catch {
        return null;
    }
}
