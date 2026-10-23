import { generatePlansSafe } from '@aihome/planner';
import { PLAN_PRESETS } from '@/features/plan';
import type { PlanProposal, Project } from '@/features/projects';

type DemoBatch = { readonly presetIndex: number; readonly at: string };

let nextPlanId = 1;

function buildPlans(
    projectId: number,
    batches: readonly DemoBatch[],
): PlanProposal[] {
    return batches.flatMap(({ presetIndex, at }) => {
        const preset = PLAN_PRESETS[presetIndex];
        const result = preset ? generatePlansSafe(preset.input) : null;
        if (!result?.ok) return [];
        return result.data.plans.map((plan) => ({
            id: nextPlanId++,
            project_id: projectId,
            label: plan.label,
            score: { ...plan.score },
            model: { ...plan.model },
            created_at: at,
            updated_at: at,
        }));
    });
}

function buildProject(
    id: number,
    title: string,
    batches: readonly DemoBatch[],
): Project {
    const last = batches.at(-1)?.at ?? '2026-10-01T00:00:00Z';
    return {
        id,
        user_id: 1,
        title,
        status: 'submitted',
        config_version: 1,
        answers: {},
        submitted_at: last,
        created_at: batches[0]?.at ?? last,
        updated_at: last,
        deleted_at: null,
        plans: buildPlans(id, batches),
    };
}

/** Dev only (`#/history?demo=1`): projects with stored plans built from the plan presets. */
export function buildDemoProjects(): Project[] {
    nextPlanId = 1;
    return [
        buildProject(101, '世田谷区 2階建てモダン住宅', [
            { presetIndex: 1, at: '2026-10-10T10:00:00Z' },
            { presetIndex: 2, at: '2026-10-12T15:30:00Z' },
        ]),
        buildProject(102, '鎌倉市 自然素材の平屋プラン', [
            { presetIndex: 0, at: '2026-10-08T09:15:00Z' },
        ]),
    ];
}
