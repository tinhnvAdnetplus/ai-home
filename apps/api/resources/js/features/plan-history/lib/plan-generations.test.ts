import { describe, expect, it } from 'vitest';
import { generatePlansSafe } from '@aihome/planner';
import type { PlanProposal } from '@/features/projects';
import { PLAN_PRESETS } from '@/features/plan';
import { groupPlanGenerations } from './plan-generations';

function proposal(
    id: number,
    label: string,
    createdAt: string,
    model: object = {},
): PlanProposal {
    return {
        id,
        project_id: 1,
        label,
        score: { total: 80 + id },
        model: { ...model },
        created_at: createdAt,
        updated_at: createdAt,
    };
}

describe('groupPlanGenerations', () => {
    it('groups plans uploaded together and lists the newest generation first', () => {
        const generations = groupPlanGenerations([
            proposal(1, 'A', '2026-10-10T10:00:00Z'),
            proposal(2, 'B', '2026-10-10T10:00:01Z'),
            proposal(3, 'C', '2026-10-10T10:00:01Z'),
            proposal(4, 'A', '2026-10-12T09:00:00Z'),
            proposal(5, 'B', '2026-10-12T09:00:00Z'),
        ]);

        expect(generations.map((g) => g.index)).toEqual([2, 1]);
        expect(generations[0]?.plans.map((p) => p.id)).toEqual([4, 5]);
        expect(generations[1]?.plans.map((p) => p.id)).toEqual([1, 2, 3]);
        expect(generations[1]?.createdAt).toBe('2026-10-10T10:00:00Z');
    });

    it('starts a new generation when a label repeats within the time window', () => {
        const generations = groupPlanGenerations([
            proposal(1, 'A', '2026-10-10T10:00:00Z'),
            proposal(2, 'B', '2026-10-10T10:00:00Z'),
            proposal(3, 'A', '2026-10-10T10:00:20Z'),
        ]);

        expect(generations).toHaveLength(2);
        expect(generations[0]?.plans.map((p) => p.id)).toEqual([3]);
    });

    it('keeps the stored score and marks an invalid model as unrenderable', () => {
        const [generation] = groupPlanGenerations([
            proposal(1, 'A', '2026-10-10T10:00:00Z', { broken: true }),
        ]);

        expect(generation?.plans[0]?.totalScore).toBe(81);
        expect(generation?.plans[0]?.model).toBeNull();
    });

    it('parses a stored planner model back into a building model', () => {
        const preset = PLAN_PRESETS[0];
        const result = preset ? generatePlansSafe(preset.input) : null;
        if (!result?.ok) throw new Error('preset failed to generate');
        const stored: unknown = JSON.parse(
            JSON.stringify(result.data.plans[0].model),
        );
        if (typeof stored !== 'object' || stored === null) {
            throw new Error('model did not serialise to an object');
        }

        const [generation] = groupPlanGenerations([
            proposal(1, 'A', '2026-10-10T10:00:00Z', stored),
        ]);

        expect(generation?.plans[0]?.model?.floors.length).toBe(
            result.data.plans[0].model.floors.length,
        );
    });

    it('returns no generations for a project without plans', () => {
        expect(groupPlanGenerations([])).toEqual([]);
    });
});
