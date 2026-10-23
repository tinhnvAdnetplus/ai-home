import type {
    PlanGeneration,
    ProjectHistory,
    SavedPlan,
} from './plan-generations';

export interface HistorySelection {
    readonly projectId: number | null;
    readonly planId: number | null;
}

export interface ResolvedSelection {
    readonly history: ProjectHistory;
    readonly generation: PlanGeneration;
    readonly plan: SavedPlan;
}

function readIntParam(hash: string, name: string): number | null {
    const match = new RegExp(`[?&]${name}=(\\d+)`).exec(hash);
    if (!match?.[1]) return null;
    const value = parseInt(match[1], 10);
    return Number.isInteger(value) && value > 0 ? value : null;
}

/** `#/history?project=<id>&plan=<id>` keeps the selection across reloads and in shared links. */
export function readSelectionFromHash(hash: string): HistorySelection {
    return {
        projectId: readIntParam(hash, 'project'),
        planId: readIntParam(hash, 'plan'),
    };
}

export function buildHistoryHash(
    selection: { readonly projectId: number; readonly planId: number },
    hash: string,
): string {
    const isDemo = /[?&]demo=1/.test(hash);
    const params = new URLSearchParams({
        project: selection.projectId.toString(),
        plan: selection.planId.toString(),
    });
    if (isDemo) params.set('demo', '1');
    return `#/history?${params.toString()}`;
}

/**
 * Finds the selected plan; an unknown or missing selection falls back to plan A of the
 * newest generation of the requested project (or of the most recently updated one).
 */
export function resolveSelection(
    histories: readonly ProjectHistory[],
    selection: HistorySelection,
): ResolvedSelection | null {
    for (const history of histories) {
        if (
            selection.projectId !== null &&
            history.project.id !== selection.projectId
        ) {
            continue;
        }
        for (const generation of history.generations) {
            const plan = generation.plans.find(
                (p) => p.id === selection.planId,
            );
            if (plan) return { history, generation, plan };
        }
    }

    const history =
        histories.find((h) => h.project.id === selection.projectId) ??
        histories[0];
    const generation = history?.generations[0];
    const plan = generation?.plans[0];
    return history && generation && plan ? { history, generation, plan } : null;
}
