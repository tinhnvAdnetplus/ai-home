import { type LocalizedText } from '@aihome/config-schema';

export function resolveLocalized(
    text: LocalizedText | undefined,
    lang: string,
): string {
    if (!text) {
        return '';
    }
    if (lang === 'en' && text.en) {
        return text.en;
    }
    if (lang === 'vi' && text.vi) {
        return text.vi;
    }
    return text.ja;
}

export type CommonFieldProps<TField, TValue> = {
    readonly field: TField;
    readonly value: TValue | undefined;
    readonly onChange: (value: TValue) => void;
    readonly isDisabled?: boolean | undefined;
    readonly disabledOptions?: readonly string[] | undefined;
    readonly error?: string | undefined;
};
