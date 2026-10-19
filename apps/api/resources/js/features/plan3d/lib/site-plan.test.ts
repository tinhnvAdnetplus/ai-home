import { describe, expect, it } from 'vitest';
import {
    houseGround,
    isShrubBlocked,
    planShrubs,
    planSite,
    planTrees,
} from '@aihome/render3d';

// scene metres: x across the frontage, z grows towards the road (front fence at lot.maxZ)
const wideLot = { minX: -0.9, maxX: 16.7, minZ: -14, maxZ: 6.7 };
const narrowLot = { minX: -0.9, maxX: 6.9, minZ: -14, maxZ: 6.7 };
const house = { minX: 0, maxX: 9.1, minZ: -10, maxZ: 0 };

describe('planSite', () => {
    it('puts two cars beside the house, not in front of its facade', () => {
        const plan = planSite({
            lot: wideLot,
            house,
            entX: 4.5,
            spaces: 2,
            kind: 'carport',
        });
        expect(plan.spaces).toBe(2);
        expect(plan.parking?.minX).toBeGreaterThanOrEqual(house.maxX);
        expect(plan.parking?.maxX).toBeLessThanOrEqual(wideLot.maxX - 0.3);
    });

    it('keeps the road-side shrubs off the entrance path and the gate post', () => {
        const plan = planSite({
            lot: wideLot,
            house,
            entX: 4.5,
            spaces: 2,
            kind: 'carport',
        });
        const front = planShrubs(wideLot, plan.keepClear).filter(
            (s) => s.z > wideLot.maxZ - 1,
        );
        expect(front.length).toBeGreaterThan(0);
        expect(front.some((s) => Math.abs(s.x - 4.5) < 1.2)).toBe(false);
        for (const s of front) {
            expect(isShrubBlocked(s.x, s.z, plan.keepClear)).toBe(false);
        }
    });

    it('draws only the spaces that fit across a narrow lot', () => {
        const plan = planSite({
            lot: narrowLot,
            house: { ...house, maxX: 6.4 },
            entX: 0.6,
            spaces: 4,
            kind: 'surface',
        });
        expect(plan.spaces).toBe(2);
        expect(plan.parking?.minX).toBeGreaterThanOrEqual(narrowLot.minX + 0.3);
        expect(plan.parking?.maxX).toBeLessThanOrEqual(narrowLot.maxX - 0.3);
        // the pad stays clear of the path when the entrance is near one edge
        expect(plan.parking?.minX).toBeGreaterThan(0.6 + 0.55);
    });

    it('draws no pad for zero cars or a built-in garage', () => {
        for (const [spaces, kind] of [
            [0, 'surface'],
            [2, 'garage'],
        ] as const) {
            const plan = planSite({
                lot: wideLot,
                house,
                entX: 4.5,
                spaces,
                kind,
            });
            expect(plan.parking).toBeNull();
            expect(plan.spaces).toBe(0);
        }
    });

    it('keeps garden trees and shrubs off a house that fills the lot', () => {
        // the house reaches the back fence, so the back-corner trees must move or be left out
        const big = { minX: -0.4, maxX: 15.2, minZ: -13.6, maxZ: 0 };
        const roof = houseGround(big);
        const plan = planSite({
            lot: wideLot,
            house: big,
            entX: 4.5,
            spaces: 0,
            kind: 'surface',
        });
        const planted = [...plan.keepClear, roof];
        const inRoof = (x: number, z: number): boolean =>
            x > roof.minX && x < roof.maxX && z > roof.minZ && z < roof.maxZ;
        for (const t of planTrees(wideLot, planted)) {
            expect(inRoof(t.x, t.z)).toBe(false);
        }
        for (const s of planShrubs(wideLot, planted)) {
            expect(inRoof(s.x, s.z)).toBe(false);
        }
    });
});
