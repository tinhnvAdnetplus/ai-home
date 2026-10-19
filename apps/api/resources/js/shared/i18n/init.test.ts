import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    initI18n,
    STORAGE_KEY,
    resolveInitialLanguage,
    syncLanguageState,
} from './init';

describe('shared/i18n init', () => {
    beforeEach(() => {
        window.localStorage.clear();
        document.documentElement.lang = '';
        vi.restoreAllMocks();
    });

    it('defaults to ja when nothing is stored or provided', () => {
        const lang = resolveInitialLanguage();
        expect(lang).toBe('ja');

        const i18n = initI18n();
        expect(i18n.language).toBe('ja');
        expect(document.documentElement.lang).toBe('ja');
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('ja');
    });

    it('honours explicit lang argument if supported', () => {
        const i18n = initI18n('en');
        expect(i18n.language).toBe('en');
        expect(document.documentElement.lang).toBe('en');
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('en');
    });

    it('honours localStorage value en when present', () => {
        window.localStorage.setItem(STORAGE_KEY, 'en');
        const lang = resolveInitialLanguage();
        expect(lang).toBe('en');

        const i18n = initI18n();
        expect(i18n.language).toBe('en');
        expect(document.documentElement.lang).toBe('en');
    });

    it('falls back to ja when localStorage contains garbage or unsupported language code', () => {
        window.localStorage.setItem(STORAGE_KEY, 'fr');
        expect(resolveInitialLanguage()).toBe('ja');

        window.localStorage.setItem(STORAGE_KEY, 'garbage_value_123');
        expect(resolveInitialLanguage()).toBe('ja');

        const i18n = initI18n();
        expect(i18n.language).toBe('ja');
    });

    it('falls back to ja without crashing when localStorage throws on access', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Access denied (SecurityError)');
        });

        expect(() => resolveInitialLanguage()).not.toThrow();
        expect(resolveInitialLanguage()).toBe('ja');

        let i18n: ReturnType<typeof initI18n> | undefined;
        expect(() => {
            i18n = initI18n();
        }).not.toThrow();
        expect(i18n?.language).toBe('ja');
    });

    it('honours html lang attribute when localStorage is empty and html lang is valid', () => {
        document.documentElement.lang = 'vi';
        expect(resolveInitialLanguage()).toBe('vi');
    });

    it('falls back to ja when explicit language argument is unsupported', () => {
        const i18n = initI18n('unsupported-code');
        expect(i18n.language).toBe('ja');
    });

    it('falls back to ja when a key is missing in en', () => {
        const i18n = initI18n('en');
        // Add a temporary resource only in ja
        i18n.addResource('ja', 'common', 'onlyInJapanese', '日本語だけ');
        // In en, it should fallback to ja value
        // @ts-expect-error Dynamically added resource key for testing fallback
        expect(i18n.t('onlyInJapanese')).toBe('日本語だけ');
    });

    it('returns the key without throwing when an unknown key is requested', () => {
        const i18n = initI18n('ja');
        // @ts-expect-error Testing fallback behavior when runtime receives an unknown key
        const result = i18n.t('completelyUnknownKey');
        expect(result).toBe('completelyUnknownKey');
    });

    it('updates rendered text, html lang, and storage on changeLanguage and switches back', async () => {
        const i18n = initI18n('ja');
        expect(i18n.language).toBe('ja');
        expect(i18n.t('common:retry')).toBe('再試行');
        expect(document.documentElement.lang).toBe('ja');
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('ja');

        await i18n.changeLanguage('vi');
        expect(i18n.language).toBe('vi');
        expect(i18n.t('common:retry')).toBe('Thử lại');
        expect(document.documentElement.lang).toBe('vi');
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('vi');

        await i18n.changeLanguage('en');
        expect(i18n.language).toBe('en');
        expect(i18n.t('common:retry')).toBe('Retry');
        expect(document.documentElement.lang).toBe('en');
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('en');

        await i18n.changeLanguage('ja');
        expect(i18n.language).toBe('ja');
        expect(i18n.t('common:retry')).toBe('再試行');
        expect(document.documentElement.lang).toBe('ja');
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('ja');
    });

    it('syncLanguageState safely handles storage setItem throwing', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });

        expect(() => {
            syncLanguageState('vi');
        }).not.toThrow();
        expect(document.documentElement.lang).toBe('vi');
    });
});
