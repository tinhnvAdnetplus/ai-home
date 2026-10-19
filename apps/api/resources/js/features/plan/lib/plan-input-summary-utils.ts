import { type TFunction } from 'i18next';

export function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function resolveText(val: unknown, lang: string): string {
    if (typeof val === 'string') {
        return val;
    }
    if (isRecord(val)) {
        const localized = val[lang] ?? val.ja ?? val.en ?? '';
        return typeof localized === 'string' ? localized : '';
    }
    return '';
}

export function formatValue(val: unknown, t: TFunction): string {
    if (val === undefined || val === null || val === '') {
        return '—';
    }
    if (typeof val === 'boolean') {
        return val ? t('plan:valueYes') : t('plan:valueNo');
    }
    if (Array.isArray(val)) {
        const items = val
            .filter(
                (item): item is string | number =>
                    typeof item === 'string' || typeof item === 'number',
            )
            .map(String);
        return items.length > 0
            ? items.join(t('plan:listSeparator'))
            : t('plan:valueNone');
    }
    if (typeof val === 'number') {
        return val.toString();
    }
    if (typeof val === 'string') {
        return val;
    }
    return '';
}
