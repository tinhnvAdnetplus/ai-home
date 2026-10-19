import { type Issue } from './issue-codes.js';
import {
    MAX_FIELDS_TOTAL,
    MAX_OPTIONS_PER_FIELD,
    MAX_SECTIONS_PER_STEP,
    MAX_STEPS,
} from './types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function limitIssue(
    path: readonly (string | number)[],
    what: string,
    count: number,
    max: number,
): Issue {
    return {
        path,
        code: 'LIMIT_EXCEEDED',
        message: `${what} count ${count.toString()} exceeds maximum ${max.toString()}`,
    };
}

/**
 * Cheap structural limit check that runs BEFORE the Zod schema.
 *
 * Zod walks the whole input, so a hostile config with 100k steps would burn ~20 s of CPU before the
 * limit was ever reported. This only reads array lengths level by level and returns on the first
 * violation, so its cost is bounded by the limits themselves, not by the size of the input.
 */
export function precheckLimits(input: unknown): Issue[] {
    if (!isRecord(input)) {
        return [];
    }
    const steps = input.steps;
    if (!Array.isArray(steps)) {
        return [];
    }
    if (steps.length > MAX_STEPS) {
        return [limitIssue(['steps'], 'Steps', steps.length, MAX_STEPS)];
    }

    let fieldTotal = 0;
    for (const [stepIndex, step] of steps.entries()) {
        if (!isRecord(step) || !Array.isArray(step.sections)) {
            continue;
        }
        const sections: unknown[] = step.sections;
        if (sections.length > MAX_SECTIONS_PER_STEP) {
            return [
                limitIssue(
                    ['steps', stepIndex, 'sections'],
                    'Sections',
                    sections.length,
                    MAX_SECTIONS_PER_STEP,
                ),
            ];
        }
        for (const [sectionIndex, section] of sections.entries()) {
            if (!isRecord(section) || !Array.isArray(section.fields)) {
                continue;
            }
            const fields: unknown[] = section.fields;
            fieldTotal += fields.length;
            if (fieldTotal > MAX_FIELDS_TOTAL) {
                return [
                    limitIssue(
                        [
                            'steps',
                            stepIndex,
                            'sections',
                            sectionIndex,
                            'fields',
                        ],
                        'Fields',
                        fieldTotal,
                        MAX_FIELDS_TOTAL,
                    ),
                ];
            }
            for (const [fieldIndex, field] of fields.entries()) {
                if (isRecord(field) && Array.isArray(field.options)) {
                    const count: number = field.options.length;
                    if (count > MAX_OPTIONS_PER_FIELD) {
                        return [
                            limitIssue(
                                [
                                    'steps',
                                    stepIndex,
                                    'sections',
                                    sectionIndex,
                                    'fields',
                                    fieldIndex,
                                    'options',
                                ],
                                'Options',
                                count,
                                MAX_OPTIONS_PER_FIELD,
                            ),
                        ];
                    }
                }
            }
        }
    }
    return [];
}
