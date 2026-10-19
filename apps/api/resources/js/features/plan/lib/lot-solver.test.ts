import { describe, expect, it } from 'vitest';
import {
    generatePlansSafe,
    lotOverflow,
    validateLayout,
} from '@aihome/planner';

function plansFor(answers: Record<string, unknown>) {
    const res = generatePlansSafe({
        plan_type: 'two_story',
        plan_ldk_size: 'size_18',
        plan_master_bedroom_size: 'size_8',
        plan_kids_room_count: 'count_2',
        plan_kids_room_size: 'size_6',
        road_side: 'south',
        ...answers,
    });
    if (!res.ok) throw new Error('generation failed');
    return res.data.plans;
}

const roomJo = (
    plan: ReturnType<typeof plansFor>[number],
    type: string,
): number[] =>
    plan.model.floors
        .flatMap((f) => f.rooms)
        .filter((r) => r.type === type)
        .map((r) => r.areaM2 / 1.62);

describe('lot-first solver', () => {
    it('fits a two-storey house with two cars on a 12 m × 12 m lot, keeping the rooms asked for', () => {
        const plans = plansFor({
            frontage: 12,
            depth: 12,
            land_area: 43,
            plan_parking_count: 'cars_2',
            plan_parking_options: ['carport'],
        });
        const fitted = plans.filter((p) =>
            p.warnings.some((w) => w.code === 'LAYOUT_FITTED_TO_LOT'),
        );
        expect(fitted.length).toBeGreaterThan(0);
        for (const p of fitted) {
            expect(lotOverflow(p.model)).toBeNull();
            expect(
                validateLayout(p.model).filter((i) => i.level === 'error'),
            ).toEqual([]);
            expect(roomJo(p, 'childRoom')).toHaveLength(2);
            expect(Math.min(...roomJo(p, 'childRoom'))).toBeGreaterThan(5);
            expect(roomJo(p, 'bedroom')[0]).toBeGreaterThan(7);
        }
    });

    it('builds a wide, shallow house on a 16 m × 9 m lot instead of one that sticks out', () => {
        const plans = plansFor({
            frontage: 16,
            depth: 9,
            land_area: 43,
            plan_parking_count: 'none',
        });
        for (const p of plans) expect(lotOverflow(p.model)).toBeNull();
    });
});
