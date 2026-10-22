import { type WizardConfig } from '@aihome/config-schema';

function fileName(item: unknown): string | null {
    if (typeof item === 'string') {
        return item;
    }
    if (typeof item === 'object' && item !== null && 'name' in item) {
        const name: unknown = item.name;
        if (typeof name === 'string') {
            return name;
        }
    }
    return null;
}

function toMediaReferences(raw: unknown): readonly string[] | null {
    if (!Array.isArray(raw) || raw.every((item) => typeof item === 'string')) {
        return null;
    }
    const names: string[] = [];
    for (const item of raw) {
        const name = fileName(item);
        if (name !== null) {
            names.push(name);
        }
    }
    return names;
}

/**
 * Repairs answers restored from an older stored draft.
 *
 * Upload answers are a list of media references (strings), per AnswerValue.
 * Drafts written before that was enforced hold `{ name, size }` objects, which
 * the API rejects — and because one bad value fails the whole payload, every
 * later draft save returned HTTP 422. Keep the file names, drop the rest.
 */
export function normalizeLegacyAnswers(
    wizard: WizardConfig,
    answers: Record<string, unknown>,
): Record<string, unknown> {
    let next: Record<string, unknown> | null = null;
    for (const step of wizard.steps) {
        for (const section of step.sections) {
            for (const field of section.fields) {
                if (field.type !== 'upload') {
                    continue;
                }
                const repaired = toMediaReferences(answers[field.key]);
                if (repaired === null) {
                    continue;
                }
                next ??= { ...answers };
                next[field.key] = repaired;
            }
        }
    }
    return next ?? answers;
}
