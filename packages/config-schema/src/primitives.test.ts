import { describe, expect, it } from 'vitest';
import {
    BINDING_KEY_REGEX,
    bindingKeySchema,
    DENIED_KEYS,
    keySchema,
    localizedTextSchema,
    mediaRefSchema,
} from './primitives.js';

describe('localizedTextSchema', () => {
    it('accepts valid Japanese text and trims whitespace', () => {
        const parsed = localizedTextSchema.parse({ ja: '  こんにちは  ' });
        expect(parsed.ja).toBe('こんにちは');
    });

    it('accepts Japanese, Vietnamese diacritics, English, and emoji', () => {
        const input = {
            ja: '理想のマイホーム 🏠',
            en: 'Dream Home 🏡',
            vi: 'Ngôi nhà mơ ước 🏡',
        };
        const parsed = localizedTextSchema.parse(input);
        expect(parsed.ja).toBe('理想のマイホーム 🏠');
        expect(parsed.en).toBe('Dream Home 🏡');
        expect(parsed.vi).toBe('Ngôi nhà mơ ước 🏡');
    });

    it('rejects when ja is missing', () => {
        const res = localizedTextSchema.safeParse({ en: 'Hello' });
        expect(res.success).toBe(false);
    });

    it('rejects empty or whitespace-only strings for ja', () => {
        expect(localizedTextSchema.safeParse({ ja: '' }).success).toBe(false);
        expect(localizedTextSchema.safeParse({ ja: '   ' }).success).toBe(
            false,
        );
    });

    it('rejects strings longer than 500 characters', () => {
        const longText = 'a'.repeat(501);
        expect(localizedTextSchema.safeParse({ ja: longText }).success).toBe(
            false,
        );
    });

    it('rejects unknown language keys (strict)', () => {
        const res = localizedTextSchema.safeParse({
            ja: 'こんにちは',
            fr: 'bonjour',
        });
        expect(res.success).toBe(false);
    });
});

describe('keySchema', () => {
    it('accepts valid keys', () => {
        expect(keySchema.safeParse('a').success).toBe(true);
        expect(keySchema.safeParse('land_tsubo').success).toBe(true);
        expect(keySchema.safeParse('step_1_details').success).toBe(true);
        expect(keySchema.safeParse('a' + '1'.repeat(47)).success).toBe(true);
    });

    it('rejects uppercase, hyphens, and leading digits', () => {
        expect(keySchema.safeParse('LandTsubo').success).toBe(false);
        expect(keySchema.safeParse('land-tsubo').success).toBe(false);
        expect(keySchema.safeParse('1land').success).toBe(false);
        expect(keySchema.safeParse('_land').success).toBe(false);
    });

    it('rejects keys longer than 48 characters', () => {
        expect(keySchema.safeParse('a'.repeat(49)).success).toBe(false);
    });

    it('rejects every deny-listed key to prevent prototype pollution', () => {
        for (const denied of DENIED_KEYS) {
            expect(keySchema.safeParse(denied).success).toBe(false);
            expect(keySchema.safeParse(denied.toUpperCase()).success).toBe(
                false,
            );
        }
    });

    it('rejects __proto__ and constructor', () => {
        expect(keySchema.safeParse('__proto__').success).toBe(false);
        expect(keySchema.safeParse('constructor').success).toBe(false);
    });
});

describe('bindingKeySchema', () => {
    it('accepts valid dot.case binding keys', () => {
        expect(bindingKeySchema.safeParse('site.frontage').success).toBe(true);
        expect(bindingKeySchema.safeParse('building.ldkSize').success).toBe(
            true,
        );
        expect(
            bindingKeySchema.safeParse('rooms.toilets.firstFloor').success,
        ).toBe(true);
        expect(bindingKeySchema.safeParse('simple').success).toBe(true);
    });

    it('rejects invalid dot.case characters or structure', () => {
        expect(bindingKeySchema.safeParse('Site.frontage').success).toBe(false);
        expect(bindingKeySchema.safeParse('site..frontage').success).toBe(
            false,
        );
        expect(bindingKeySchema.safeParse('site.front-age').success).toBe(
            false,
        );
        expect(bindingKeySchema.safeParse('site.frontage.').success).toBe(
            false,
        );
        expect(bindingKeySchema.safeParse('a'.repeat(65)).success).toBe(false);
    });

    it('matches regex pattern directly', () => {
        expect(BINDING_KEY_REGEX.test('site.frontage')).toBe(true);
        expect(BINDING_KEY_REGEX.test('invalid-binding')).toBe(false);
    });
});

describe('mediaRefSchema', () => {
    it('accepts valid media reference', () => {
        const res = mediaRefSchema.safeParse({
            mediaId: 'med_facade_01',
            alt: { ja: '外観写真' },
        });
        expect(res.success).toBe(true);
    });

    it('rejects invalid mediaId characters or length', () => {
        expect(
            mediaRefSchema.safeParse({
                mediaId: 'bad id with spaces',
                alt: { ja: '写真' },
            }).success,
        ).toBe(false);
        expect(
            mediaRefSchema.safeParse({
                mediaId: 'a'.repeat(65),
                alt: { ja: '写真' },
            }).success,
        ).toBe(false);
    });
});
