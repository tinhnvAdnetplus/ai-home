import { type Field } from './field-schemas.js';
import { type Issue } from './issue-codes.js';
import {
    checkDefaultInOptions,
    checkOptions,
    checkSelectionLimits,
} from './field-options-validator.js';

function checkNumeric(
    field: Extract<Field, { type: 'number' | 'range' }>,
    path: readonly (string | number)[],
    issues: Issue[],
): void {
    const { min, max, step, defaultValue } = field;
    if (min !== undefined && max !== undefined && min > max) {
        issues.push({
            path: [...path, 'min'],
            code: 'RANGE_INVALID',
            message: `min (${min.toString()}) cannot exceed max (${max.toString()})`,
        });
    }
    if (step !== undefined && step <= 0) {
        issues.push({
            path: [...path, 'step'],
            code: 'RANGE_INVALID',
            message: `step must be positive, got ${step.toString()}`,
        });
    }
    if (defaultValue !== undefined) {
        if (min !== undefined && defaultValue < min) {
            issues.push({
                path: [...path, 'defaultValue'],
                code: 'DEFAULT_OUT_OF_RANGE',
                message: `defaultValue ${defaultValue.toString()} < min ${min.toString()}`,
            });
        }
        if (max !== undefined && defaultValue > max) {
            issues.push({
                path: [...path, 'defaultValue'],
                code: 'DEFAULT_OUT_OF_RANGE',
                message: `defaultValue ${defaultValue.toString()} > max ${max.toString()}`,
            });
        }
    }
}

export function validateField(
    field: Field,
    path: readonly (string | number)[],
): Issue[] {
    const issues: Issue[] = [];
    if ('options' in field) {
        checkOptions(field, path, issues);
        checkDefaultInOptions(field, path, issues);
    }
    if (field.type === 'number' || field.type === 'range') {
        checkNumeric(field, path, issues);
    }
    if (field.type === 'checkbox_group' || field.type === 'image_select') {
        checkSelectionLimits(field, path, issues);
    }
    return issues;
}
