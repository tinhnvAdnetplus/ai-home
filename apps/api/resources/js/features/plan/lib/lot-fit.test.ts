import { describe, expect, it } from 'vitest';
import { generatePlansSafe } from '@aihome/planner';
import { lotOverflow } from './lot-fit';

function plansFor(answers: Record<string, unknown>) {
    const res = generatePlansSafe(answers);
    if (!res.ok) throw new Error('generation failed');
    return res.data.plans;
}

describe('house on the lot', () => {
    it('fits the default 12 m × 14 m lot with two cars (parking moves or setbacks tighten)', () => {
        const plans = plansFor({
            frontage: 12,
            depth: 14,
            land_area: 50,
            plan_type: 'two_story',
            plan_parking_count: 'cars_2',
            plan_parking_options: ['carport'],
        });
        for (const p of plans) expect(lotOverflow(p.model)).toBeNull();
    });

    it('flags a single-storey house that cannot fit a small lot', () => {
        const plans = plansFor({
            frontage: 7,
            depth: 12,
            land_area: 25,
            plan_type: 'one_story',
            plan_parking_count: 'cars_2',
        });
        for (const p of plans) {
            const over = lotOverflow(p.model);
            expect(over).not.toBeNull();
            expect((over?.widthM ?? 0) + (over?.depthM ?? 0)).toBeGreaterThan(
                0,
            );
        }
    });
});
