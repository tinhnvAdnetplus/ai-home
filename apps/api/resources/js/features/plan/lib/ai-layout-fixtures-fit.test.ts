import { describe, it, expect } from 'vitest';
import {
    checkAiLayout,
    fitAiLayoutFixtures,
    mapAnswersToPlanInput,
    type AiLayout,
    type AiLayoutDoor,
    type AiLayoutFixture,
    type PlanInput,
} from '@aihome/planner';

// entrance0 2x2 at (0,0), ldk1 6x6 at (2,0), hall2 2x4 at (0,2) on an 8x6 floor.
function baseLayout(
    fixtures: AiLayoutFixture[],
    doors: AiLayoutDoor[] = [],
): AiLayout {
    return {
        gridW: 8,
        floors: [
            {
                level: 1,
                gridD: 6,
                rooms: [
                    {
                        key: 'entrance0',
                        name: '玄関',
                        type: 'entrance',
                        rects: [{ x: 0, y: 0, w: 2, h: 2 }],
                    },
                    {
                        key: 'ldk1',
                        name: 'LDK',
                        type: 'ldk',
                        rects: [{ x: 2, y: 0, w: 6, h: 6 }],
                    },
                    {
                        key: 'hall2',
                        name: 'ホール',
                        type: 'hall',
                        rects: [{ x: 0, y: 2, w: 2, h: 4 }],
                    },
                ],
                doors,
                fixtures,
            },
        ],
    };
}

// Door on the x=2 line between entrance0 and ldk1: clearance covers cells x1-2, y0-1.
const ldkDoor: AiLayoutDoor = {
    room: 'ldk1',
    dir: 'v',
    pos: 2,
    a: 0,
    b: 2,
    kind: 'swing',
};

function input(): PlanInput {
    return { ...mapAnswersToPlanInput({}).input, floors: 1 };
}

function fit(fixtures: AiLayoutFixture[], doors: AiLayoutDoor[] = []) {
    const res = fitAiLayoutFixtures(baseLayout(fixtures, doors));
    const furnitureErrors = checkAiLayout(res.layout, input()).filter(
        (m) => m.includes('家具') || m.includes('fixtures'),
    );
    return {
        fixtures: res.layout.floors[0]?.fixtures ?? [],
        actions: res.changes.map((c) => c.action),
        furnitureErrors,
    };
}

describe('fitAiLayoutFixtures', () => {
    it('keeps a fixture that already fits exactly where the AI put it', () => {
        const sofa: AiLayoutFixture = {
            room: 'ldk1',
            kind: 'sofa',
            x: 3,
            y: 1,
            rotation: 0,
        };
        const r = fit([sofa]);
        expect(r.actions).toEqual([]);
        expect(r.fixtures).toEqual([sofa]);
    });

    it('shifts a fixture out of a door clearance to the nearest free cell against a wall', () => {
        const r = fit(
            [{ room: 'ldk1', kind: 'sofa', x: 2, y: 0, rotation: 0 }],
            [ldkDoor],
        );
        expect(r.actions).toEqual(['moved']);
        expect(r.fixtures[0]).toMatchObject({ x: 3, y: 0, rotation: 0 });
        expect(r.furnitureErrors).toEqual([]);
    });

    it('separates two overlapping fixtures, keeping both', () => {
        const r = fit([
            { room: 'ldk1', kind: 'sofa', x: 2, y: 0, rotation: 0 },
            { room: 'ldk1', kind: 'tv_board', x: 3, y: 0, rotation: 0 },
        ]);
        expect(r.fixtures).toHaveLength(2);
        expect(r.fixtures[0]).toMatchObject({ kind: 'sofa', x: 2, y: 0 });
        expect(r.actions).toEqual(['moved']);
        expect(r.furnitureErrors).toEqual([]);
    });

    it('turns a fixture a quarter when it only fits the other way round', () => {
        // kitchen_counter is 3x1 cells; the 2-wide hall only takes it as 1x3.
        const r = fit([
            {
                room: 'hall2',
                kind: 'kitchen_counter',
                x: 0,
                y: 2,
                rotation: 0,
            },
        ]);
        expect(r.actions).toEqual(['rotated']);
        expect(r.fixtures[0]).toMatchObject({ rotation: 90 });
        expect(r.furnitureErrors).toEqual([]);
    });

    it('swaps in a smaller kind when neither orientation fits', () => {
        // sofa_l is 3x2 / 2x3; the 2x2 entrance only takes a 2x1 sofa.
        const r = fit([
            { room: 'entrance0', kind: 'sofa_l', x: 0, y: 0, rotation: 0 },
        ]);
        expect(r.actions).toEqual(['downsized']);
        expect(r.fixtures[0]).toMatchObject({ kind: 'sofa' });
        expect(r.furnitureErrors).toEqual([]);
    });

    it('drops a fixture that cannot fit at all, and one in a missing room', () => {
        const r = fit([
            {
                room: 'entrance0',
                kind: 'bed_double',
                x: 0,
                y: 0,
                rotation: 0,
            },
            { room: 'kitchen', kind: 'fridge', x: 4, y: 4, rotation: 0 },
        ]);
        expect(r.actions).toEqual(['dropped', 'dropped']);
        expect(r.fixtures).toEqual([]);
        expect(r.furnitureErrors).toEqual([]);
    });

    it('leaves no furniture error for a crowded, door-blocked room', () => {
        const r = fit(
            [
                { room: 'ldk1', kind: 'kitchen_l', x: 2, y: 0, rotation: 0 },
                {
                    room: 'ldk1',
                    kind: 'dining_table_6',
                    x: 3,
                    y: 1,
                    rotation: 0,
                },
                { room: 'ldk1', kind: 'sofa_l', x: 4, y: 2, rotation: 90 },
                { room: 'ldk1', kind: 'tv_board', x: 4, y: 3, rotation: 0 },
                { room: 'ldk1', kind: 'low_table', x: 9, y: 9, rotation: 0 },
            ],
            [ldkDoor],
        );
        expect(r.furnitureErrors).toEqual([]);
        expect(r.fixtures.length).toBeGreaterThanOrEqual(4);
    });
});
