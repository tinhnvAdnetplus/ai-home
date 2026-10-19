import {
    createProject,
    submitProject,
    updateAnswers,
    uploadPlans,
} from '../api/projects-api';

export interface PlanItemPayload {
    readonly label: string;
    readonly score?: Record<string, unknown> | undefined;
    readonly model: Record<string, unknown>;
}

export function isRecord(val: unknown): val is Record<string, unknown> {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
}

export function formatProjectDate(isoDate: string, lang: string): string {
    const locale = lang === 'en' ? 'en-US' : lang === 'vi' ? 'vi-VN' : 'ja-JP';
    return new Date(isoDate).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getProjectIdFromHash(): number | null {
    if (typeof window === 'undefined') {
        return null;
    }
    const match = /[?&]project=(\d+)/.exec(window.location.hash);
    if (match?.[1]) {
        const id = parseInt(match[1], 10);
        return Number.isInteger(id) && id > 0 ? id : null;
    }
    return null;
}

export function getDraftAnswersFromEvent(
    event: Event,
): Record<string, unknown> | null {
    if ('detail' in event && isRecord(event.detail)) {
        const detail = event.detail;
        if ('answers' in detail && isRecord(detail.answers)) {
            return detail.answers;
        }
    }
    return null;
}

export function seedLocalStorageWithDraft(
    answers: Record<string, unknown>,
    stepIndex = 0,
): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key?.startsWith('aihome.wizard.draft.')) {
                window.localStorage.setItem(
                    key,
                    JSON.stringify({ answers, stepIndex }),
                );
            }
        }
    } catch {
        // Storage might be unavailable or disabled
    }
}

export function updateUrlHashWithProjectId(id: number): void {
    if (typeof window === 'undefined') {
        return;
    }
    const hash = window.location.hash;
    if (!hash.includes('project=')) {
        const sep = hash.includes('?') ? '&' : '?';
        window.location.hash = `${hash}${sep}project=${id.toString()}`;
    }
}

let inflightCreate: Promise<number> | null = null;

/** Creates the project once, even when several saves race (React strict mode, fast typing). */
async function createProjectOnce(): Promise<number> {
    inflightCreate ??= (async () => {
        const dateStr = new Date().toLocaleDateString('ja-JP');
        const created = await createProject({
            title: `新しいプロジェクト ${dateStr}`,
        });
        return created.id;
    })().finally(() => {
        inflightCreate = null;
    });
    return inflightCreate;
}

export async function persistProjectAnswers(
    projectId: number | null,
    answers: Record<string, unknown>,
): Promise<{ readonly id: number }> {
    const currentId = projectId ?? (await createProjectOnce());
    // Save the answers BEFORE touching the URL: changing the hash re-mounts the flow
    // and used to abort this function, leaving empty duplicate projects behind.
    await updateAnswers(currentId, answers);
    if (projectId === null) updateUrlHashWithProjectId(currentId);
    return { id: currentId };
}

export async function submitProjectWithPlans(
    projectId: number,
    plans?: readonly PlanItemPayload[],
): Promise<void> {
    await submitProject(projectId);
    if (plans && plans.length > 0) {
        const payload = plans.slice(0, 3).map((p) => ({
            label: p.label,
            score: p.score,
            model: p.model,
        }));
        await uploadPlans(projectId, payload);
    }
}
