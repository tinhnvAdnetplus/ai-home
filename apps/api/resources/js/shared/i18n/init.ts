import i18next, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ja from './locales/ja.json';
import vi from './locales/vi.json';

export const SUPPORTED_LANGUAGES = ['ja', 'en', 'vi'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'ja';
export const STORAGE_KEY = 'aihome.lang';

export const resources = {
    ja,
    en,
    vi,
} as const;

export function isSupportedLanguage(lang: unknown): lang is SupportedLanguage {
    return lang === 'ja' || lang === 'en' || lang === 'vi';
}

export function getStoredLanguage(): SupportedLanguage | null {
    try {
        if (import.meta.env.DEV && typeof window !== 'undefined') {
            const forced = new URLSearchParams(window.location.search).get(
                'lang',
            );
            if (isSupportedLanguage(forced)) return forced;
        }
        if (
            typeof window !== 'undefined' &&
            typeof window.localStorage !== 'undefined'
        ) {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (isSupportedLanguage(stored)) {
                return stored;
            }
        }
    } catch {
        // Storage access may throw in restricted environments
    }
    return null;
}

export function setStoredLanguage(lang: SupportedLanguage): void {
    try {
        if (
            typeof window !== 'undefined' &&
            typeof window.localStorage !== 'undefined'
        ) {
            window.localStorage.setItem(STORAGE_KEY, lang);
        }
    } catch {
        // Ignore storage write errors safely
    }
}

export function getHtmlLang(): SupportedLanguage | null {
    if (typeof document !== 'undefined') {
        const htmlLang = document.documentElement.lang;
        if (isSupportedLanguage(htmlLang)) {
            return htmlLang;
        }
    }
    return null;
}

export function resolveInitialLanguage(
    explicitLang?: string,
): SupportedLanguage {
    if (explicitLang !== undefined && explicitLang !== '') {
        return isSupportedLanguage(explicitLang)
            ? explicitLang
            : DEFAULT_LANGUAGE;
    }

    const stored = getStoredLanguage();
    if (stored !== null) {
        return stored;
    }

    const htmlLang = getHtmlLang();
    if (htmlLang !== null) {
        return htmlLang;
    }

    return DEFAULT_LANGUAGE;
}

export function syncLanguageState(lang: string): void {
    const targetLang: SupportedLanguage = isSupportedLanguage(lang)
        ? lang
        : DEFAULT_LANGUAGE;

    if (typeof document !== 'undefined') {
        document.documentElement.lang = targetLang;
    }

    setStoredLanguage(targetLang);
}

export function initI18n(lang?: string): I18nInstance {
    const instance = i18next.createInstance();
    const initialLang = resolveInitialLanguage(lang);

    void instance.use(initReactI18next).init({
        lng: initialLang,
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: SUPPORTED_LANGUAGES,
        resources,
        defaultNS: 'common',
        ns: [
            'common',
            'health',
            'errors',
            'wizard',
            'plan',
            'plan3d',
            'auth',
            'projects',
            'admin',
            'ai',
        ],
        interpolation: {
            escapeValue: false,
        },
        returnNull: false,
    });

    syncLanguageState(initialLang);

    instance.on('languageChanged', (changedLng: string) => {
        syncLanguageState(changedLng);
    });

    return instance;
}
