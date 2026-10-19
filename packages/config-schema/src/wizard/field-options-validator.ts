import { MAX_OPTIONS_PER_FIELD } from './types.js';
import { type Field } from './field-schemas.js';
import { type Issue } from './issue-codes.js';

export function checkOptions(
    field: Extract<Field, { options: unknown }>,
    path: readonly (string | number)[],
    issues: Issue[],
): void {
    if (field.options.length > MAX_OPTIONS_PER_FIELD) {
        issues.push({
            path: [...path, 'options'],
            code: 'LIMIT_EXCEEDED',
            message: `Options count ${field.options.length.toString()} exceeds maximum ${MAX_OPTIONS_PER_FIELD.toString()}`,
        });
    }
    if (field.options.length === 0) {
        issues.push({
            path: [...path, 'options'],
            code: 'EMPTY_OPTIONS',
            message: `Field '${field.key}' must have at least one option`,
        });
    }
    const seenValues = new Set<string>();
    field.options.forEach((opt, idx) => {
        if (seenValues.has(opt.value)) {
            issues.push({
                path: [...path, 'options', idx, 'value'],
                code: 'DUPLICATE_KEY',
                message: `Duplicate option value '${opt.value}' in field '${field.key}'`,
            });
        } else {
            seenValues.add(opt.value);
        }
    });
}

export function checkDefaultInOptions(
    field: Extract<Field, { options: unknown }>,
    path: readonly (string | number)[],
    issues: Issue[],
): void {
    const valid = new Set(field.options.map((opt) => opt.value));
    if (
        (field.type === 'select' || field.type === 'radio') &&
        field.defaultValue
    ) {
        if (!valid.has(field.defaultValue)) {
            issues.push({
                path: [...path, 'defaultValue'],
                code: 'DEFAULT_NOT_IN_OPTIONS',
                message: `defaultValue '${field.defaultValue}' not in available options`,
            });
        }
    } else if (field.type === 'checkbox_group' && field.defaultValue) {
        if (field.defaultValue.some((val) => !valid.has(val))) {
            issues.push({
                path: [...path, 'defaultValue'],
                code: 'DEFAULT_NOT_IN_OPTIONS',
                message:
                    'defaultValue contains values not in available options',
            });
        }
    } else if (field.type === 'image_select' && field.defaultValue) {
        const defaults = Array.isArray(field.defaultValue)
            ? field.defaultValue
            : [field.defaultValue];
        if (defaults.some((val) => !valid.has(val))) {
            issues.push({
                path: [...path, 'defaultValue'],
                code: 'DEFAULT_NOT_IN_OPTIONS',
                message: 'defaultValue is not among available options',
            });
        }
    }
}

export function checkSelectionLimits(
    field: Extract<Field, { type: 'checkbox_group' | 'image_select' }>,
    path: readonly (string | number)[],
    issues: Issue[],
): void {
    const count = field.options.length;
    const { minSelected, maxSelected } = field;
    if (
        minSelected !== undefined &&
        maxSelected !== undefined &&
        minSelected > maxSelected
    ) {
        issues.push({
            path: [...path, 'minSelected'],
            code: 'SELECTION_LIMITS_INVALID',
            message: `minSelected (${minSelected.toString()}) > maxSelected (${maxSelected.toString()})`,
        });
    }
    if (minSelected !== undefined && (minSelected < 0 || minSelected > count)) {
        issues.push({
            path: [...path, 'minSelected'],
            code: 'SELECTION_LIMITS_INVALID',
            message: `minSelected must be between 0 and ${count.toString()}`,
        });
    }
    if (
        maxSelected !== undefined &&
        (maxSelected <= 0 || maxSelected > count)
    ) {
        issues.push({
            path: [...path, 'maxSelected'],
            code: 'SELECTION_LIMITS_INVALID',
            message: `maxSelected must be between 1 and ${count.toString()}`,
        });
    }
}
