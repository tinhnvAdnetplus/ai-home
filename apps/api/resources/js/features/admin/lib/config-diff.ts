import type { WizardConfig, Field } from '@aihome/config-schema';
import type { DiffSummary } from '../types/admin-types';

function extractFieldMap(
    config: WizardConfig | null | undefined,
): Map<string, Field> {
    const map = new Map<string, Field>();
    if (!config) {
        return map;
    }

    for (const step of config.steps) {
        for (const section of step.sections) {
            for (const field of section.fields) {
                map.set(field.key, field);
            }
        }
    }

    return map;
}

export function computeWizardConfigDiff(
    baseConfig: WizardConfig | null | undefined,
    targetConfig: WizardConfig | null | undefined,
): DiffSummary {
    const baseMap = extractFieldMap(baseConfig);
    const targetMap = extractFieldMap(targetConfig);

    let addedCount = 0;
    let removedCount = 0;
    let changedCount = 0;

    for (const [key, targetField] of targetMap.entries()) {
        const baseField = baseMap.get(key);
        if (baseField === undefined) {
            addedCount += 1;
        } else {
            const baseStr = JSON.stringify(baseField);
            const targetStr = JSON.stringify(targetField);
            if (baseStr !== targetStr) {
                changedCount += 1;
            }
        }
    }

    for (const key of baseMap.keys()) {
        if (!targetMap.has(key)) {
            removedCount += 1;
        }
    }

    return {
        addedCount,
        removedCount,
        changedCount,
    };
}
