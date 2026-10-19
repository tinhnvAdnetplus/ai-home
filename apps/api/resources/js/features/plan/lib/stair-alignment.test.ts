import { describe, it, expect } from 'vitest';
import { generatePlansSafe, mapAnswersToPlanInput } from '@aihome/planner';
import { getDefaultWizardAnswers } from '@/features/wizard';

describe('Staircase multi-floor alignment', () => {
    function assertStairsMatch(answers: Record<string, unknown>): void {
        const mapped = mapAnswersToPlanInput(answers);
        const result = generatePlansSafe(mapped.input);

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        for (const plan of result.data.plans) {
            const m = plan.model;
            if (m.floors.length < 2) continue;

            const stair1 = m.floors[0]?.rooms.find((r) => r.type === 'stairs');
            const stair2 = m.floors[1]?.rooms.find((r) => r.type === 'stairs');

            expect(stair1).toBeDefined();
            expect(stair2).toBeDefined();

            if (stair1 && stair2) {
                const p1 = stair1.polygon;
                const p2 = stair2.polygon;

                const xs1 = p1.map((p) => p.x);
                const ys1 = p1.map((p) => p.y);
                const xs2 = p2.map((p) => p.x);
                const ys2 = p2.map((p) => p.y);

                const minX1 = Math.min(...xs1);
                const maxX1 = Math.max(...xs1);
                const minY1 = Math.min(...ys1);
                const maxY1 = Math.max(...ys1);

                const minX2 = Math.min(...xs2);
                const maxX2 = Math.max(...xs2);
                const minY2 = Math.min(...ys2);
                const maxY2 = Math.max(...ys2);

                expect(minX2).toBeCloseTo(minX1, 0);
                expect(maxX2).toBeCloseTo(maxX1, 0);
                expect(minY2).toBeCloseTo(minY1, 0);
                expect(maxY2).toBeCloseTo(maxY1, 0);

                const stairErrors = plan.warnings.filter(
                    (w) => w.code === 'LAYOUT_STAIR_MISALIGNED',
                );
                expect(stairErrors).toHaveLength(0);
            }
        }
    }

    it('ensures 1F and 2F stairs share identical footprint in default answers', () => {
        assertStairsMatch(getDefaultWizardAnswers());
    });

    it('ensures 1F and 2F stairs align with extra rooms (study, fam closet, 2F wash)', () => {
        const base = getDefaultWizardAnswers();
        const custom = {
            ...base,
            extraRooms: ['書斎'],
            storageOptions: ['ファミリークローゼット'],
            waterOptions: ['2階洗面', 'ランドリールーム'],
            kidsRoomCount: '3部屋',
        };
        assertStairsMatch(custom);
    });

    it('ensures 1F and 2F stairs align on narrow lots', () => {
        const base = getDefaultWizardAnswers();
        const narrow = {
            ...base,
            frontageM: '8.5',
            depthM: '18.0',
        };
        assertStairsMatch(narrow);
    });
});
