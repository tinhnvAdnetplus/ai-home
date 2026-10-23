import { describe, expect, it } from 'vitest';
import type { Project } from '@/features/projects';
import type { ProjectHistory } from './plan-generations';
import {
    buildHistoryHash,
    readSelectionFromHash,
    resolveSelection,
} from './history-selection';

function history(projectId: number, planIds: number[][]): ProjectHistory {
    return {
        project: {
            id: projectId,
            user_id: 1,
            title: `Project ${projectId.toString()}`,
            status: 'submitted',
            created_at: '2026-10-10T10:00:00Z',
            updated_at: '2026-10-10T10:00:00Z',
            plans: [],
        } satisfies Project,
        generations: planIds.map((ids, i) => ({
            index: planIds.length - i,
            createdAt: '2026-10-10T10:00:00Z',
            plans: ids.map((id) => ({
                id,
                label: `P${id.toString()}`,
                totalScore: null,
                model: null,
                createdAt: '2026-10-10T10:00:00Z',
            })),
        })),
    };
}

const histories = [
    history(7, [
        [30, 31],
        [10, 11],
    ]),
    history(8, [[40]]),
];

describe('history selection', () => {
    it('reads the project and plan ids from the hash', () => {
        expect(readSelectionFromHash('#/history?project=7&plan=11')).toEqual({
            projectId: 7,
            planId: 11,
        });
        expect(readSelectionFromHash('#/history')).toEqual({
            projectId: null,
            planId: null,
        });
    });

    it('builds a hash that keeps the dev demo flag', () => {
        expect(
            buildHistoryHash({ projectId: 7, planId: 11 }, '#/history?demo=1'),
        ).toBe('#/history?project=7&plan=11&demo=1');
    });

    it('finds the requested plan in an older generation', () => {
        const resolved = resolveSelection(histories, {
            projectId: 7,
            planId: 11,
        });
        expect(resolved?.plan.id).toBe(11);
        expect(resolved?.generation.index).toBe(1);
    });

    it('falls back to the newest plan of the project, then of the first project', () => {
        expect(
            resolveSelection(histories, { projectId: 8, planId: 999 })?.plan.id,
        ).toBe(40);
        expect(
            resolveSelection(histories, { projectId: null, planId: null })?.plan
                .id,
        ).toBe(30);
    });

    it('returns null when there is nothing to show', () => {
        expect(
            resolveSelection([], { projectId: null, planId: null }),
        ).toBeNull();
    });
});
