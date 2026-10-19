import { describe, it, expect } from 'vitest';
import { formatNumber, formatDateTime } from './format';

describe('shared/lib/format formatNumber', () => {
    it('formats numbers in ja, en, and vi correctly', () => {
        const val = 1234567.891;
        expect(formatNumber(val, 'ja')).toBe('1,234,567.891');
        expect(formatNumber(val, 'en')).toBe('1,234,567.891');
        expect(formatNumber(val, 'vi')).toBe('1.234.567,891');
    });

    it('returns "-" as safe fallback on invalid inputs', () => {
        expect(formatNumber(Number.NaN)).toBe('-');
        expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('-');
        expect(formatNumber(Number.NEGATIVE_INFINITY)).toBe('-');
        // Testing runtime non-number inputs
        // @ts-expect-error Testing non-number input at runtime
        expect(formatNumber('123')).toBe('-');
        // @ts-expect-error Testing null input at runtime
        expect(formatNumber(null)).toBe('-');
    });
});

describe('shared/lib/format formatDateTime', () => {
    it('converts UTC ISO string to Tokyo time for ja', () => {
        const utcIso = '2026-10-12T02:35:33Z';
        const formattedJa = formatDateTime(utcIso, 'ja');
        expect(formattedJa).toContain('2026');
        expect(formattedJa).toContain('11:35:33');
    });

    it('formats UTC ISO string in en and vi', () => {
        const utcIso = '2026-10-12T02:35:33Z';
        const formattedEn = formatDateTime(utcIso, 'en');
        const formattedVi = formatDateTime(utcIso, 'vi');

        expect(formattedEn).toContain('2026');
        expect(formattedEn).toContain('02:35:33');
        expect(formattedVi).toContain('2026');
        expect(formattedVi).toContain('02:35:33');
    });

    it('respects custom timeZone option when provided', () => {
        const utcIso = '2026-10-12T02:35:33Z';
        const formatted = formatDateTime(utcIso, 'en', {
            timeZone: 'Asia/Tokyo',
        });
        expect(formatted).toContain('11:35:33');
    });

    it('returns "-" as safe fallback on invalid date inputs', () => {
        expect(formatDateTime('invalid-date-string')).toBe('-');
        expect(formatDateTime('')).toBe('-');
        // @ts-expect-error Testing runtime non-string input
        expect(formatDateTime(null)).toBe('-');
    });
});
