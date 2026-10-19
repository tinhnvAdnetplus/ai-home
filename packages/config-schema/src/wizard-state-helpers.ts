import { type Field } from './wizard/field-schemas.js';
import { type WizardConfig } from './wizard/wizard-schema.js';

export function collectFields(wizard: WizardConfig): Field[] {
    const fields: Field[] = [];
    for (const step of wizard.steps) {
        for (const section of step.sections) {
            for (const field of section.fields) {
                fields.push(field);
            }
        }
    }
    return fields;
}

export function filterDisabledOptions(
    field: Field,
    rawAnswer: unknown,
    disabledOptions: readonly string[],
): { isAnswerDropped: boolean; nextAnswer: unknown } {
    if (disabledOptions.length === 0) {
        return { isAnswerDropped: false, nextAnswer: rawAnswer };
    }
    const disabledSet = new Set(disabledOptions);

    if (field.type === 'checkbox_group') {
        if (Array.isArray(rawAnswer)) {
            const filtered = rawAnswer.filter(
                (item) => typeof item === 'string' && !disabledSet.has(item),
            );
            return { isAnswerDropped: false, nextAnswer: filtered };
        }
        return { isAnswerDropped: false, nextAnswer: rawAnswer };
    }

    if (field.type === 'image_select' && field.multiple) {
        if (Array.isArray(rawAnswer)) {
            const filtered = rawAnswer.filter(
                (item) => typeof item === 'string' && !disabledSet.has(item),
            );
            return { isAnswerDropped: false, nextAnswer: filtered };
        }
        return { isAnswerDropped: false, nextAnswer: rawAnswer };
    }

    if (
        field.type === 'select' ||
        field.type === 'radio' ||
        field.type === 'image_select'
    ) {
        if (typeof rawAnswer === 'string' && disabledSet.has(rawAnswer)) {
            return { isAnswerDropped: true, nextAnswer: undefined };
        }
    }

    return { isAnswerDropped: false, nextAnswer: rawAnswer };
}

export function isAnswerEmpty(field: Field, value: unknown): boolean {
    if (value === null || value === undefined) {
        return true;
    }
    if (field.type === 'boolean') {
        return typeof value !== 'boolean';
    }
    if (typeof value === 'string') {
        return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    if (typeof value === 'number') {
        return !Number.isFinite(value);
    }
    return true;
}
