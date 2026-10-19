import { type Step, type WizardState } from '@aihome/config-schema';

export function validateCurrentStep(
    step: Step,
    answers: Record<string, unknown>,
    resolvedState: WizardState,
    getRequiredMsg: () => string,
    getRangeMsg: (min: number, max: number) => string,
): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const section of step.sections) {
        for (const field of section.fields) {
            const isVisible = resolvedState.visible[field.key] ?? true;
            const isDisabled = resolvedState.disabled[field.key] ?? false;
            if (!isVisible || isDisabled) {
                continue;
            }

            if (resolvedState.missingRequired.includes(field.key)) {
                errors[field.key] = getRequiredMsg();
                continue;
            }

            if (field.type === 'number' || field.type === 'range') {
                const val = answers[field.key];
                if (typeof val === 'number') {
                    if (field.min !== undefined && val < field.min) {
                        errors[field.key] = getRangeMsg(
                            field.min,
                            field.max ?? 10000,
                        );
                    } else if (field.max !== undefined && val > field.max) {
                        errors[field.key] = getRangeMsg(
                            field.min ?? 0,
                            field.max,
                        );
                    }
                }
            }
        }
    }

    return errors;
}
