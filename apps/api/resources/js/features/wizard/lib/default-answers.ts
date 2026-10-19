import { resolveWizardState, type WizardConfig } from '@aihome/config-schema';
import { validatedDefaultWizard } from '../data/load-wizard';

export function extractDefaults(wizard: WizardConfig): Record<string, unknown> {
    const defaults: Record<string, unknown> = {};
    for (const step of wizard.steps) {
        for (const section of step.sections) {
            for (const field of section.fields) {
                if (
                    'defaultValue' in field &&
                    field.defaultValue !== undefined
                ) {
                    defaults[field.key] = field.defaultValue;
                }
            }
        }
    }
    return defaults;
}

export function getDefaultWizardAnswers(): Record<string, unknown> {
    const defaults = extractDefaults(validatedDefaultWizard);
    return resolveWizardState(validatedDefaultWizard, defaults).answers;
}
