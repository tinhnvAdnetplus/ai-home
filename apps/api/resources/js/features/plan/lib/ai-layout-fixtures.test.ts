import { describe, it, expect } from 'vitest';
import {
    checkAiLayout,
    planFromAiLayout,
    mapAnswersToPlanInput,
    defaultPlannerConfig,
    VARIANTS,
    type AiLayout,
    type AiLayoutDoor,
    type AiLayoutFixture,
    type PlanInput,
} from '@aihome/planner';

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

function input(): PlanInput {
    return { ...mapAnswersToPlanInput({}).input, floors: 1 };
}

describe('AI-authored fixtures: validation and mm conversion', () => {
    it('flags two fixtures in the same room that overlap', () => {
        const layout = baseLayout([
            { room: 'ldk1', kind: 'sofa', x: 2, y: 0, rotation: 0 },
            // sofa footprint ~1800x850mm -> ceil(1800/910)=2, ceil(850/910)=1 -> 2x1 cells at (2,0)
            // this one starts at x=3, overlapping the sofa's x2-4 span.
            { room: 'ldk1', kind: 'tv_board', x: 3, y: 0, rotation: 0 },
        ]);
        const errors = checkAiLayout(layout, input());
        expect(errors.some((m) => m.includes('重なっています'))).toBe(true);
    });

    it('flags a fixture that sticks out of its room', () => {
        const layout = baseLayout([
            // entrance0 is only 2x2 cells (x0-2,y0-2); a desk (1100x580 -> 2x1 cells) at x=1
            // overflows to x=3, outside the room.
            { room: 'entrance0', kind: 'desk', x: 1, y: 0, rotation: 0 },
        ]);
        const errors = checkAiLayout(layout, input());
        expect(errors.some((m) => m.includes('はみ出しています'))).toBe(true);
    });

    it('flags a fixture that blocks a door clearance path', () => {
        // Door on the x=2 edge between entrance0 and ldk1 (the shared boundary), spanning y0-2.
        const door: AiLayoutDoor = {
            room: 'ldk1',
            dir: 'v',
            pos: 2,
            a: 0,
            b: 2,
            kind: 'swing',
        };
        const layout = baseLayout(
            [{ room: 'ldk1', kind: 'sofa', x: 2, y: 0, rotation: 0 }],
            [door],
        );
        const errors = checkAiLayout(layout, input());
        expect(
            errors.some((m) => m.includes('ドアの開閉スペースを塞いでいます')),
        ).toBe(true);
    });

    it('does not flag a fixture placed well clear of a door', () => {
        const door: AiLayoutDoor = {
            room: 'ldk1',
            dir: 'v',
            pos: 2,
            a: 0,
            b: 2,
            kind: 'swing',
        };
        const layout = baseLayout(
            [{ room: 'ldk1', kind: 'sofa', x: 5, y: 4, rotation: 0 }],
            [door],
        );
        const errors = checkAiLayout(layout, input());
        expect(
            errors.some((m) => m.includes('ドアの開閉スペースを塞いでいます')),
        ).toBe(false);
    });

    it('converts a valid fixture to the correct mm position in the BDM model', () => {
        const layout = baseLayout([
            { room: 'ldk1', kind: 'sofa', x: 3, y: 1, rotation: 0 },
        ]);
        const errors = checkAiLayout(layout, input());
        expect(errors).toHaveLength(0);

        const variant = VARIANTS[0];
        expect(variant).toBeDefined();
        if (!variant) return;
        const plan = planFromAiLayout(
            input(),
            layout,
            variant,
            defaultPlannerConfig,
            1,
        );
        const fixtures = plan.model.floors[0]?.fixtures ?? [];
        const sofa = fixtures.find((f) => f.kind === 'sofa');
        expect(sofa).toBeDefined();
        expect(sofa?.pos).toEqual({ x: 3 * 910, y: 1 * 910 });
        expect(sofa?.rotation).toBe(0);
    });
});
