import { describe, it, expect } from 'vitest';
import {
    checkAiLayout,
    mapAnswersToPlanInput,
    type AiLayout,
    type PlanInput,
} from '@aihome/planner';

function input(): PlanInput {
    return { ...mapAnswersToPlanInput({}).input, floors: 2 };
}

function layoutWithDepths(d1: number, d2: number): AiLayout {
    // Minimal rooms — this test only cares about the floor-depth check, so other rules (entrance
    // position, LDK sun-facing, stairs alignment...) are deliberately left unsatisfied; we assert
    // only on the presence/absence of the depth-specific message, not full layout validity.
    return {
        gridW: 6,
        floors: [
            {
                level: 1,
                gridD: d1,
                rooms: [
                    {
                        key: 'ldk0',
                        name: 'LDK',
                        type: 'ldk',
                        rects: [{ x: 0, y: 0, w: 6, h: d1 }],
                    },
                ],
            },
            {
                level: 2,
                gridD: d2,
                rooms: [
                    {
                        key: 'bedroom0',
                        name: '主寝室',
                        type: 'bedroom',
                        rects: [{ x: 0, y: 0, w: 6, h: d2 }],
                    },
                ],
            },
        ],
    };
}

describe('checkAiLayout: 2nd floor cannot be deeper than the 1st', () => {
    it('rejects a 2F gridD larger than 1F — nothing holds up the overhang', () => {
        const errors = checkAiLayout(layoutWithDepths(8, 12), input());
        expect(
            errors.some((m) => m.includes('1階gridD=8より大きくなっています')),
        ).toBe(true);
    });

    it('allows a 2F gridD equal to 1F', () => {
        const errors = checkAiLayout(layoutWithDepths(8, 8), input());
        expect(errors.some((m) => m.includes('より大きくなっています'))).toBe(
            false,
        );
    });

    it('allows a shallower 2F gridD (shed-roof / 下屋 style)', () => {
        const errors = checkAiLayout(layoutWithDepths(8, 6), input());
        expect(errors.some((m) => m.includes('より大きくなっています'))).toBe(
            false,
        );
    });
});
