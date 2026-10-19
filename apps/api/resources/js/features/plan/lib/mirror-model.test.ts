import { describe, it, expect } from 'vitest';
import { type BuildingModel } from '@aihome/bdm';
import { mirrorModelY } from './mirror-model';

function buildModel(
    fixtures: BuildingModel['floors'][number]['fixtures'],
): BuildingModel {
    return {
        schemaVersion: 1,
        meta: { generator: 'test', seed: 1, inputHash: 'x' },
        site: {
            boundary: [
                { x: 0, y: 0 },
                { x: 1000, y: 0 },
                { x: 1000, y: 8000 },
                { x: 0, y: 8000 },
            ],
            areaM2: 1,
            road: { side: '南', widthMm: 4000 },
            setbacks: { frontMm: 0, rearMm: 0, leftMm: 0, rightMm: 0 },
        },
        floors: [
            {
                level: 1,
                elevationMm: 0,
                heightMm: 2900,
                rooms: [],
                walls: [
                    {
                        id: 'w1',
                        a: { x: 0, y: 0 },
                        b: { x: 0, y: 8000 },
                        thicknessMm: 150,
                        kind: 'exterior',
                    },
                ],
                openings: [],
                fixtures,
                stairs: [],
            },
        ],
        roof: { kind: 'gabled', pitch: 4, overhangMm: 600 },
        parking: { spaces: 0, kind: 'surface' },
        warnings: [],
    };
}

describe('mirrorModelY on fixtures', () => {
    it('reflects a fixture rectangle (not just its anchor point) across the Y axis', () => {
        // Original rect for a bed_double (1500x2000mm, rotation 0) at pos (1000, 2000):
        // spans y in [2000, 4000]. `top` is the max y among walls/boundary = 8000.
        // A correct mirror must map that INTERVAL to [top-4000, top-2000] = [4000, 6000],
        // i.e. the new pos.y (top-left again) must be 4000 — not top-2000=6000, which is what
        // flipping only the anchor point (ignoring height) would wrongly give.
        const model = buildModel([
            { id: 'fx1', kind: 'bed_double', pos: { x: 1000, y: 2000 }, rotation: 0 },
        ]);
        const mirrored = mirrorModelY(model);
        const fx = mirrored.floors[0]?.fixtures[0];
        expect(fx?.pos).toEqual({ x: 1000, y: 4000 });
        expect(fx?.rotation).toBe(0);
    });

    it('swaps the footprint used for the flip when the item is rotated 90°', () => {
        // Rotated 90°, bed_double's footprint becomes 2000x1500 (width/height swapped), so its
        // height for the flip is 1500, not 2000.
        const model = buildModel([
            { id: 'fx1', kind: 'bed_double', pos: { x: 1000, y: 2000 }, rotation: 90 },
        ]);
        const mirrored = mirrorModelY(model);
        const fx = mirrored.floors[0]?.fixtures[0];
        expect(fx?.pos).toEqual({ x: 1000, y: 8000 - 2000 - 1500 });
        expect(fx?.rotation).toBe(270);
    });

    it('leaves an unknown/legacy kind at its own anchor point (height treated as 0)', () => {
        const model = buildModel([
            { id: 'fx1', kind: 'some_future_kind', pos: { x: 1000, y: 2000 }, rotation: 0 },
        ]);
        const mirrored = mirrorModelY(model);
        const fx = mirrored.floors[0]?.fixtures[0];
        expect(fx?.pos).toEqual({ x: 1000, y: 8000 - 2000 });
    });
});
