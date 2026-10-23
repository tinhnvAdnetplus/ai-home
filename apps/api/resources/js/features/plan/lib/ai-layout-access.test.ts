import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
    checkAiLayout,
    planFromAiLayout,
    mapAnswersToPlanInput,
    defaultPlannerConfig,
    VARIANTS,
    type AiLayout,
    type PlanInput,
} from '@aihome/planner';

type Floor = AiLayout['floors'][number];
type Room = Floor['rooms'][number];

const room = (
    key: string,
    name: string,
    type: Room['type'],
    rects: Room['rects'],
): Room => ({ key, name, type, rects });

/**
 * 8x6, one floor. Stairs (1,2)-(3,5) land at y=5 onto the hall's lower arm; the hall runs up
 * x=0 to the entrance and right into the LDK; a store off the entrance has its own door.
 */
function validFloor(): Floor {
    return {
        level: 1,
        gridD: 6,
        rooms: [
            room('entrance', '玄関', 'entrance', [{ x: 0, y: 0, w: 2, h: 2 }]),
            room('store', '収納', 'storage', [{ x: 2, y: 0, w: 1, h: 2 }]),
            room('stairs', '階段', 'stairs', [{ x: 1, y: 2, w: 2, h: 3 }]),
            room('hall', 'ホール', 'hall', [
                { x: 0, y: 2, w: 1, h: 4 },
                { x: 1, y: 5, w: 2, h: 1 },
            ]),
            room('ldk', 'LDK', 'ldk', [{ x: 3, y: 0, w: 5, h: 6 }]),
        ],
        doors: [{ room: 'store', dir: 'v', pos: 2, a: 0, b: 1, kind: 'swing' }],
    };
}

/** Same floor, but the landing row (1,5)-(3,5) is a store instead of hall. */
function landingOnStoreFloor(): Floor {
    return {
        level: 1,
        gridD: 6,
        rooms: [
            room('entrance', '玄関', 'entrance', [{ x: 0, y: 0, w: 3, h: 2 }]),
            room('stairs', '階段', 'stairs', [{ x: 1, y: 2, w: 2, h: 3 }]),
            room('hall', 'ホール', 'hall', [{ x: 0, y: 2, w: 1, h: 4 }]),
            room('store', '収納', 'storage', [{ x: 1, y: 5, w: 2, h: 1 }]),
            room('ldk', 'LDK', 'ldk', [{ x: 3, y: 0, w: 5, h: 6 }]),
        ],
        doors: [{ room: 'store', dir: 'v', pos: 1, a: 5, b: 6, kind: 'swing' }],
    };
}

const layoutOf = (fl: Floor): AiLayout => ({ gridW: 8, floors: [fl] });

function input(): PlanInput {
    return { ...mapAnswersToPlanInput({}).input, floors: 1 };
}

function gridErrors(layout: AiLayout): string[] {
    return checkAiLayout(layout, input(), { shouldRequireDoors: true });
}

/** Error codes the 3D-model validator (the final accept/reject gate) reports for the layout. */
function modelErrorCodes(layout: AiLayout): string[] {
    const variant = VARIANTS[0];
    if (!variant) throw new Error('no variant');
    const plan = planFromAiLayout(
        input(),
        layout,
        variant,
        defaultPlannerConfig,
        1,
    );
    return plan.warnings.filter((w) => w.level === 'error').map((w) => w.code);
}

describe('grid checks match the model validator on access', () => {
    it('accepts a layout whose landing opens onto the hall and every room is reachable', () => {
        const layout = layoutOf(validFloor());
        expect(gridErrors(layout)).toEqual([]);
        expect(modelErrorCodes(layout)).toEqual([]);
    });

    it('rejects a landing that opens onto a store, in both checks', () => {
        const layout = layoutOf(landingOnStoreFloor());
        const grid = gridErrors(layout);
        expect(
            grid.some((m) => m.includes('踊り場') && m.includes('収納')),
        ).toBe(true);
        expect(modelErrorCodes(layout)).toEqual(
            expect.arrayContaining([
                'LAYOUT_STAIR_BLOCKED',
                'LAYOUT_STAIR_NO_LANDING',
            ]),
        );
    });

    it('rejects a closed room with no way in, in both checks', () => {
        const layout = layoutOf({ ...validFloor(), doors: [] });
        const grid = gridErrors(layout);
        expect(
            grid.some((m) => m.includes('行けない部屋') && m.includes('収納')),
        ).toBe(true);
        expect(modelErrorCodes(layout)).toContain('LAYOUT_UNREACHABLE');
    });
});

/**
 * Every rule that makes validateLayout reject a plan needs a grid-level counterpart in
 * checkAiLayout, or the AI is never told about it until all other issues are gone. This list is
 * the inventory of those counterparts; adding an error rule to plan-validator.ts without also
 * covering it in the grid checks (and here) fails this test.
 */
const GRID_COUNTERPART: Record<string, string> = {
    LAYOUT_OUTSIDE_LOT: 'ai-layout-check.ts: gridW / gridD vs layoutLimits',
    LAYOUT_VOID_AREA: 'ai-layout-check.ts: empty and overlapping cells',
    LAYOUT_UNREACHABLE: 'ai-layout-check-access.ts: checkFloorReach',
    LAYOUT_STAIR_BLOCKED: 'ai-layout-check-access.ts: checkFloorStairsLanding',
    LAYOUT_STAIR_NO_LANDING:
        'ai-layout-check-access.ts: checkFloorStairsLanding',
    LAYOUT_STAIR_MISALIGNED: 'ai-layout-check.ts: same stairs rect per floor',
};

describe('model validator error inventory', () => {
    it('has a grid-level counterpart for every error-level rule', () => {
        const src = fs.readFileSync(
            path.resolve(
                __dirname,
                '../../../../../../../packages/planner/src/plan-validator.ts',
            ),
            'utf-8',
        );
        const errorCodes = [
            ...src.matchAll(
                /issue\(\s*'(LAYOUT_[A-Z_]+)',[\s\S]*?'(warn|error)',?\s*\)/g,
            ),
        ]
            .filter((m) => m[2] === 'error')
            .map((m) => m[1] ?? '');
        expect(errorCodes.length).toBeGreaterThan(0);
        expect([...new Set(errorCodes)].sort()).toEqual(
            Object.keys(GRID_COUNTERPART).sort(),
        );
    });
});
