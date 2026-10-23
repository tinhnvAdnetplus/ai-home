import { migrateBuildingModel, type BuildingModel } from '@aihome/bdm';
import type { PlanProposal, Project } from '@/features/projects';

/** Plans uploaded by one submit land within seconds of each other; a later regenerate is a new batch. */
const SAME_BATCH_WINDOW_MS = 60 * 1000;

export interface SavedPlan {
    readonly id: number;
    readonly label: string;
    readonly totalScore: number | null;
    /** null when the stored model no longer passes BDM validation */
    readonly model: BuildingModel | null;
    readonly createdAt: string;
}

export interface PlanGeneration {
    /** 1-based, oldest generation is #1 */
    readonly index: number;
    readonly createdAt: string;
    readonly plans: readonly SavedPlan[];
}

export interface ProjectHistory {
    readonly project: Project;
    readonly generations: readonly PlanGeneration[];
}

function readTotalScore(score: PlanProposal['score']): number | null {
    const total = score?.total;
    return typeof total === 'number' && Number.isFinite(total) ? total : null;
}

export function toSavedPlan(proposal: PlanProposal): SavedPlan {
    const parsed = migrateBuildingModel(proposal.model);
    return {
        id: proposal.id,
        label: proposal.label,
        totalScore: readTotalScore(proposal.score),
        model: parsed.ok ? parsed.data : null,
        createdAt: proposal.created_at,
    };
}

/**
 * Groups a project's stored plans into the generations that produced them, newest first.
 * The API keeps every upload (each submit appends up to 3 plans), so a batch is recognised
 * by upload time; a repeated label also starts a new batch.
 */
export function groupPlanGenerations(
    proposals: readonly PlanProposal[],
): PlanGeneration[] {
    const sorted = [...proposals].sort(
        (a, b) =>
            Date.parse(a.created_at) - Date.parse(b.created_at) || a.id - b.id,
    );

    const batches: PlanProposal[][] = [];
    for (const proposal of sorted) {
        const current = batches.at(-1);
        const first = current?.[0];
        const isSameBatch =
            current !== undefined &&
            first !== undefined &&
            current.length < 3 &&
            Date.parse(proposal.created_at) - Date.parse(first.created_at) <=
                SAME_BATCH_WINDOW_MS &&
            !current.some((p) => p.label === proposal.label);
        if (isSameBatch) {
            current.push(proposal);
        } else {
            batches.push([proposal]);
        }
    }

    return batches
        .map((batch, i) => ({
            index: i + 1,
            createdAt: batch[0]?.created_at ?? '',
            plans: batch.map(toSavedPlan),
        }))
        .reverse();
}
