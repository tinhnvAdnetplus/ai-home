import { collectConditionVars, type Condition } from '../condition.js';
import { MAX_FIELDS_TOTAL, MAX_SECTIONS_PER_STEP, MAX_STEPS } from './types.js';
import { type Field } from './field-schemas.js';
import { type WizardConfig } from './wizard-schema.js';
import { type Issue } from './issue-codes.js';
import { detectConditionCycles } from './cycle-detect.js';
import { validateFieldBinding } from './binding-validator.js';
import { validateField } from './field-validator.js';

function checkFieldConditions(
    field: Field,
    fieldPath: readonly (string | number)[],
    allFieldKeys: ReadonlySet<string>,
    dependencyGraph: Map<string, string[]>,
    issues: Issue[],
): void {
    const deps: string[] = [];
    const inspectCond = (
        cond: Condition | undefined,
        condProp: string,
    ): void => {
        if (!cond) return;
        const vars = collectConditionVars(cond);
        for (const v of vars) {
            if (v === field.key) {
                issues.push({
                    path: [...fieldPath, condProp],
                    code: 'SELF_REFERENCE',
                    message: `Field '${field.key}' references itself in ${condProp}`,
                });
            } else if (!allFieldKeys.has(v)) {
                issues.push({
                    path: [...fieldPath, condProp],
                    code: 'UNKNOWN_FIELD_REF',
                    message: `Condition references unknown field '${v}'`,
                });
            } else {
                deps.push(v);
            }
        }
    };

    inspectCond(field.visibleWhen, 'visibleWhen');
    inspectCond(field.disabledWhen, 'disabledWhen');
    if ('options' in field) {
        field.options.forEach((opt, optIdx) => {
            if (opt.disabledWhen) {
                inspectCond(
                    opt.disabledWhen,
                    `options.${optIdx.toString()}.disabledWhen`,
                );
            }
        });
    }
    dependencyGraph.set(field.key, deps);
}

export function crossValidateWizard(config: WizardConfig): Issue[] {
    const issues: Issue[] = [];
    if (config.steps.length > MAX_STEPS) {
        issues.push({
            path: ['steps'],
            code: 'LIMIT_EXCEEDED',
            message: `Steps count ${config.steps.length.toString()} exceeds max ${MAX_STEPS.toString()}`,
        });
    }

    const allFieldKeys = new Set<string>();
    let totalFields = 0;
    for (const step of config.steps) {
        for (const section of step.sections) {
            totalFields += section.fields.length;
            for (const f of section.fields) allFieldKeys.add(f.key);
        }
    }

    if (totalFields > MAX_FIELDS_TOTAL) {
        issues.push({
            path: ['steps'],
            code: 'LIMIT_EXCEEDED',
            message: `Total fields ${totalFields.toString()} exceeds max ${MAX_FIELDS_TOTAL.toString()}`,
        });
    }

    const seenStepKeys = new Set<string>();
    const seenSectionKeys = new Set<string>();
    const seenFieldKeys = new Set<string>();
    const seenBindings = new Map<string, readonly (string | number)[]>();
    const fieldPaths = new Map<string, readonly (string | number)[]>();
    const dependencyGraph = new Map<string, string[]>();

    config.steps.forEach((step, sIdx) => {
        if (seenStepKeys.has(step.key)) {
            issues.push({
                path: ['steps', sIdx, 'key'],
                code: 'DUPLICATE_KEY',
                message: `Duplicate step key: ${step.key}`,
            });
        } else {
            seenStepKeys.add(step.key);
        }

        if (step.sections.length > MAX_SECTIONS_PER_STEP) {
            issues.push({
                path: ['steps', sIdx, 'sections'],
                code: 'LIMIT_EXCEEDED',
                message: `Sections in step ${sIdx.toString()} exceeds max ${MAX_SECTIONS_PER_STEP.toString()}`,
            });
        }

        step.sections.forEach((section, secIdx) => {
            if (seenSectionKeys.has(section.key)) {
                issues.push({
                    path: ['steps', sIdx, 'sections', secIdx, 'key'],
                    code: 'DUPLICATE_KEY',
                    message: `Duplicate section key: ${section.key}`,
                });
            } else {
                seenSectionKeys.add(section.key);
            }

            section.fields.forEach((field, fIdx) => {
                const fPath = [
                    'steps',
                    sIdx,
                    'sections',
                    secIdx,
                    'fields',
                    fIdx,
                ] as const;
                fieldPaths.set(field.key, fPath);

                if (seenFieldKeys.has(field.key)) {
                    issues.push({
                        path: [...fPath, 'key'],
                        code: 'DUPLICATE_KEY',
                        message: `Duplicate field key: ${field.key}`,
                    });
                } else {
                    seenFieldKeys.add(field.key);
                }

                issues.push(
                    ...validateFieldBinding(field, fPath, seenBindings),
                );
                issues.push(...validateField(field, fPath));
                checkFieldConditions(
                    field,
                    fPath,
                    allFieldKeys,
                    dependencyGraph,
                    issues,
                );
            });
        });
    });

    issues.push(...detectConditionCycles(dependencyGraph, fieldPaths));
    return issues;
}
