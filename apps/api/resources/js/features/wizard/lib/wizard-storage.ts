import { type WizardConfig } from '@aihome/config-schema';

export function computeWizardHash(wizard: WizardConfig): string {
    const raw = wizard.steps
        .map(
            (s) =>
                `${s.key}:${s.sections.map((sec) => `${sec.key}:${sec.fields.map((f) => `${f.key}-${f.type}`).join(',')}`).join(';')}`,
        )
        .join('|');

    let hash = 0x811c9dc5;
    for (let i = 0; i < raw.length; i += 1) {
        hash ^= raw.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16);
}

const STORAGE_PREFIX = 'aihome.wizard.draft.';

export type StoredDraft = {
    readonly answers: Record<string, unknown>;
    readonly stepIndex: number;
};

function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function loadStoredDraft(configHash: string): StoredDraft | null {
    try {
        if (typeof window === 'undefined') {
            return null;
        }
        const raw = window.localStorage.getItem(
            `${STORAGE_PREFIX}${configHash}`,
        );
        if (raw === null || raw === '') {
            return null;
        }
        const parsed: unknown = JSON.parse(raw);
        if (
            isRecord(parsed) &&
            isRecord(parsed.answers) &&
            typeof parsed.stepIndex === 'number'
        ) {
            return {
                answers: parsed.answers,
                stepIndex: parsed.stepIndex,
            };
        }
    } catch {
        // Return null on storage or JSON error
    }
    return null;
}

export function saveStoredDraft(
    configHash: string,
    answers: Record<string, unknown>,
    stepIndex: number,
): void {
    try {
        if (typeof window !== 'undefined') {
            const data = JSON.stringify({ answers, stepIndex });
            window.localStorage.setItem(`${STORAGE_PREFIX}${configHash}`, data);
            window.dispatchEvent(
                new CustomEvent('aihome:wizard-draft-save', {
                    detail: { answers, stepIndex, configHash },
                }),
            );
        }
    } catch {
        // Ignore storage write errors safely
    }
}

export function clearStoredDraft(configHash: string): void {
    try {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(`${STORAGE_PREFIX}${configHash}`);
        }
    } catch {
        // Ignore storage errors safely
    }
}

export function hasStoredDraftAnswers(configHash: string): boolean {
    const draft = loadStoredDraft(configHash);
    if (draft === null) {
        return false;
    }
    return draft.stepIndex > 0 || Object.keys(draft.answers).length > 0;
}

/** Removes every stored wizard draft (used when the customer starts a brand-new plan). */
export function clearAllStoredDrafts(): void {
    try {
        const keys: string[] = [];
        for (let i = 0; i < window.localStorage.length; i += 1) {
            const key = window.localStorage.key(i);
            if (key?.startsWith(STORAGE_PREFIX) === true) keys.push(key);
        }
        keys.forEach((key) => {
            window.localStorage.removeItem(key);
        });
    } catch {
        // storage unavailable: nothing to clear
    }
}
