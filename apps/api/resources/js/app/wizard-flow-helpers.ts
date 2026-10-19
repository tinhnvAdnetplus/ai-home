import { type AiAnalysisResult } from '@/features/ai';

export type AnalysisState = AiAnalysisResult & {
    readonly answers: Record<string, unknown>;
};

export function isDevResultActive(): boolean {
    if (!import.meta.env.DEV) return false;
    return (
        window.location.hash.includes('result=1') ||
        /[?&]result=1/.test(window.location.hash)
    );
}

export function isDevAnalyzingActive(): boolean {
    if (!import.meta.env.DEV) return false;
    return window.location.hash.includes('analyzing=1');
}

export function cleanResultHash(): void {
    if (window.location.hash.includes('result=1')) {
        window.location.hash = window.location.hash
            .replace(/[?&]result=1/, '')
            .replace(/#\?/, '#')
            .replace(/#$/, '');
    }
}

/** Dev only: `#/wizard?result=1&a=<base64 JSON>` overrides default answers (reproducing a customer case). */
export function readDevAnswersOverride(): Record<string, unknown> {
    if (!import.meta.env.DEV) return {};
    const m = /[?&]a=([^&]+)/.exec(window.location.hash);
    if (!m?.[1]) return {};
    try {
        const parsed: unknown = JSON.parse(atob(decodeURIComponent(m[1])));
        return typeof parsed === 'object' && parsed !== null
            ? Object.fromEntries(Object.entries(parsed))
            : {};
    } catch {
        return {};
    }
}
