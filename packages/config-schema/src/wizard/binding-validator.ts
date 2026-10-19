import { findBindingEntry } from '../binding-registry.js';
import { type Field } from './field-schemas.js';
import { type Issue } from './issue-codes.js';

function isBindingTypeCompatible(field: Field, valueType: string): boolean {
    switch (valueType) {
        case 'number':
            return field.type === 'number' || field.type === 'range';
        case 'string':
            if (field.type === 'text' || field.type === 'textarea') return true;
            if (field.type === 'select' || field.type === 'radio') return true;
            if (field.type === 'image_select') return !field.multiple;
            return false;
        case 'boolean':
            return field.type === 'boolean';
        case 'string[]':
            if (field.type === 'checkbox_group') return true;
            if (field.type === 'image_select') return field.multiple;
            return false;
        default:
            return false;
    }
}

export function validateFieldBinding(
    field: Field,
    path: readonly (string | number)[],
    seenBindings: Map<string, readonly (string | number)[]>,
): Issue[] {
    const issues: Issue[] = [];
    if (!field.binding) {
        return issues;
    }

    const bindingPath = [...path, 'binding'];
    const entry = findBindingEntry(field.binding);
    if (!entry) {
        issues.push({
            path: bindingPath,
            code: 'UNKNOWN_BINDING',
            message: `Binding key '${field.binding}' is not in the planner capability registry`,
        });
        return issues;
    }

    if (!isBindingTypeCompatible(field, entry.valueType)) {
        issues.push({
            path: bindingPath,
            code: 'BINDING_TYPE_MISMATCH',
            message: `Field type '${field.type}' is incompatible with binding '${field.binding}' which expects type '${entry.valueType}'`,
        });
    }

    const previousPath = seenBindings.get(field.binding);
    if (previousPath) {
        issues.push({
            path: bindingPath,
            code: 'DUPLICATE_BINDING',
            message: `Binding key '${field.binding}' is duplicated; already bound at ${previousPath.join('.')}`,
        });
    } else {
        seenBindings.set(field.binding, bindingPath);
    }

    return issues;
}
