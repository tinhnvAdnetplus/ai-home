import { type Field } from '@aihome/config-schema';
import { resolveLocalized } from './field-helpers';

export type SummaryLabels = {
    readonly noAnswer: string;
    readonly yes: string;
    readonly no: string;
};

function plainText(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean')
        return value.toString();
    return '';
}

function fileNames(value: readonly unknown[]): string {
    return value
        .map((file) =>
            typeof file === 'object' && file !== null && 'name' in file
                ? plainText(file.name)
                : '',
        )
        .filter((name) => name !== '')
        .join(', ');
}

export function formatAnswerValue(
    field: Field,
    value: unknown,
    lang: string,
    labels: SummaryLabels,
): string {
    if (value === undefined || value === null || value === '') {
        return labels.noAnswer;
    }
    if (
        field.type === 'radio' ||
        field.type === 'select' ||
        field.type === 'image_select'
    ) {
        const option = field.options.find((o) => o.value === value);
        return option ? resolveLocalized(option.label, lang) : plainText(value);
    }
    if (field.type === 'checkbox_group') {
        if (!Array.isArray(value) || value.length === 0) return labels.noAnswer;
        return value
            .map((item: unknown) => {
                const option = field.options.find((o) => o.value === item);
                return option
                    ? resolveLocalized(option.label, lang)
                    : plainText(item);
            })
            .join(', ');
    }
    if (field.type === 'number' || field.type === 'range') {
        return `${plainText(value)} ${field.unit ?? ''}`.trim();
    }
    if (field.type === 'boolean') {
        return value === true ? labels.yes : labels.no;
    }
    if (field.type === 'upload') {
        const names = Array.isArray(value) ? fileNames(value) : '';
        return names === '' ? labels.noAnswer : names;
    }
    return plainText(value);
}
