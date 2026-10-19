import { describe, it, expect } from 'vitest';
import en from './locales/en.json';
import ja from './locales/ja.json';
import vi from './locales/vi.json';

function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function flattenKeys(
    obj: Record<string, unknown>,
    prefix = '',
): Map<string, string> {
    const result = new Map<string, string>();
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix === '' ? key : `${prefix}.${key}`;
        if (isRecord(value)) {
            const nested = flattenKeys(value, fullKey);
            for (const [nKey, nVal] of nested.entries()) {
                result.set(nKey, nVal);
            }
        } else if (typeof value === 'string') {
            result.set(fullKey, value);
        }
    }
    return result;
}

function extractPlaceholders(text: string): string[] {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    if (!matches) {
        return [];
    }
    return matches.map((m) => m.slice(2, -2).trim()).sort();
}

describe('i18n locale parity', () => {
    const jaMap = flattenKeys(ja);
    const enMap = flattenKeys(en);
    const viMap = flattenKeys(vi);

    it('has identical keys in ja, en, and vi without any missing keys', () => {
        const jaKeys = Array.from(jaMap.keys()).sort();
        const enKeys = Array.from(enMap.keys()).sort();
        const viKeys = Array.from(viMap.keys()).sort();

        for (const key of jaKeys) {
            expect(enMap.has(key), `Missing key "${key}" in en.json`).toBe(
                true,
            );
            expect(viMap.has(key), `Missing key "${key}" in vi.json`).toBe(
                true,
            );
        }

        for (const key of enKeys) {
            expect(
                jaMap.has(key),
                `Extra key "${key}" in en.json missing in ja.json`,
            ).toBe(true);
        }

        for (const key of viKeys) {
            expect(
                jaMap.has(key),
                `Extra key "${key}" in vi.json missing in ja.json`,
            ).toBe(true);
        }
    });

    it('contains no empty strings in any locale', () => {
        for (const [key, val] of jaMap.entries()) {
            expect(
                val.trim(),
                `Empty string in ja.json at key "${key}"`,
            ).not.toBe('');
        }
        for (const [key, val] of enMap.entries()) {
            expect(
                val.trim(),
                `Empty string in en.json at key "${key}"`,
            ).not.toBe('');
        }
        for (const [key, val] of viMap.entries()) {
            expect(
                val.trim(),
                `Empty string in vi.json at key "${key}"`,
            ).not.toBe('');
        }
    });

    it('has matching interpolation placeholders across all languages', () => {
        for (const [key, jaVal] of jaMap.entries()) {
            const enVal = enMap.get(key) ?? '';
            const viVal = viMap.get(key) ?? '';

            const jaPlaceholders = extractPlaceholders(jaVal);
            const enPlaceholders = extractPlaceholders(enVal);
            const viPlaceholders = extractPlaceholders(viVal);

            expect(
                enPlaceholders,
                `Interpolation mismatch at "${key}" between ja and en`,
            ).toEqual(jaPlaceholders);
            expect(
                viPlaceholders,
                `Interpolation mismatch at "${key}" between ja and vi`,
            ).toEqual(jaPlaceholders);
        }
    });
});
