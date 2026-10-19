import { describe, it, expect } from 'vitest';
import {
    generatePlansSafe,
    mapAnswersToPlanInput,
    planFromAiLayout,
    checkAiLayout,
    defaultPlannerConfig,
    VARIANTS,
    type AiLayout,
    type PlanInput,
} from '@aihome/planner';
import { type BuildingModel } from '@aihome/bdm';
import { getDefaultWizardAnswers } from '@/features/wizard';

type Point = { readonly x: number; readonly y: number };
type Segment = { readonly a: Point; readonly b: Point };

const EPS = 1;
const close = (p: number, q: number): boolean => Math.abs(p - q) <= EPS;

/** True if point `p` lies on the axis-aligned segment `seg` (within EPS). */
function onSegment(p: Point, seg: Segment): boolean {
    if (close(seg.a.x, seg.b.x)) {
        const [y0, y1] = [
            Math.min(seg.a.y, seg.b.y),
            Math.max(seg.a.y, seg.b.y),
        ];
        return close(p.x, seg.a.x) && p.y >= y0 - EPS && p.y <= y1 + EPS;
    }
    const [x0, x1] = [Math.min(seg.a.x, seg.b.x), Math.max(seg.a.x, seg.b.x)];
    return close(p.y, seg.a.y) && p.x >= x0 - EPS && p.x <= x1 + EPS;
}

/**
 * A door/sliding-door opening on one of the stairs' 3 non-landing sides (the flight itself —
 * no floor to step onto). Only the y-large short side is a real landing.
 */
function findDoorOnStairsSide(model: BuildingModel): string | null {
    for (const floor of model.floors) {
        const stair = floor.rooms.find((r) => r.type === 'stairs');
        if (!stair) continue;
        const xs = stair.polygon.map((p) => p.x);
        const ys = stair.polygon.map((p) => p.y);
        const x1 = Math.min(...xs);
        const x2 = Math.max(...xs);
        const y1 = Math.min(...ys);
        const y2 = Math.max(...ys);
        // Landing = the y-large side (y2). The other 3 sides must stay solid, door-free.
        const nonLanding: Segment[] = [
            { a: { x: x1, y: y1 }, b: { x: x2, y: y1 } }, // top (y1)
            { a: { x: x1, y: y1 }, b: { x: x1, y: y2 } }, // left
            { a: { x: x2, y: y1 }, b: { x: x2, y: y2 } }, // right
        ];
        for (const wall of floor.walls) {
            const isOnStairsSide = nonLanding.some(
                (seg) => onSegment(wall.a, seg) && onSegment(wall.b, seg),
            );
            if (!isOnStairsSide) continue;
            const door = floor.openings.find(
                (o) =>
                    o.wallId === wall.id &&
                    (o.kind === 'door' || o.kind === 'slidingDoor'),
            );
            if (door)
                return `floor ${floor.level.toString()}: door ${door.id} on wall ${wall.id}`;
        }
    }
    return null;
}

describe('No door opens onto the stairs flight (only the landing is walkable)', () => {
    it('regression: a room beside the stairs non-landing side must not get a door there', () => {
        // Reproduces the reported bug directly: a closet sits beside the stairs' LEFT side
        // (x=2, a non-landing edge) while a hall sits on the landing (y=5). Before the fix,
        // `buildDoors` just picked the longest shared wall between two rooms, with no notion
        // of which side of the 2x3 stairs box is actually walkable — so it could cut a door
        // into the stairwell side, opening onto the flight itself with no floor to step onto.
        const input: PlanInput = {
            ...mapAnswersToPlanInput({}).input,
            floors: 1,
        };
        const layout: AiLayout = {
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
                            rects: [{ x: 4, y: 0, w: 2, h: 2 }],
                        },
                        {
                            key: 'hall1',
                            name: 'ホール',
                            type: 'hall',
                            rects: [{ x: 2, y: 5, w: 2, h: 1 }],
                        },
                        {
                            key: 'stairs2',
                            name: '階段',
                            type: 'stairs',
                            rects: [{ x: 2, y: 2, w: 2, h: 3 }],
                        },
                        {
                            key: 'closet3',
                            name: '収納',
                            type: 'closet',
                            rects: [{ x: 0, y: 2, w: 2, h: 3 }],
                        },
                        {
                            key: 'ldk4',
                            name: 'LDK',
                            type: 'ldk',
                            rects: [{ x: 4, y: 2, w: 4, h: 4 }],
                        },
                    ],
                },
            ],
        };

        const variant = VARIANTS[0];
        expect(variant).toBeDefined();
        if (!variant) return;

        const plan = planFromAiLayout(
            input,
            layout,
            variant,
            defaultPlannerConfig,
            1,
        );

        expect(findDoorOnStairsSide(plan.model)).toBeNull();
    });

    it('AI-supplied doors: a door explicitly aimed at the stairs non-landing side is rejected and never cut', () => {
        // Same room layout as above, but now the AI itself supplies `doors` (the new direct-
        // coordinate path) and — hypothetically mistaken or adversarial — points a door at the
        // stairs' LEFT side (x=2), the same non-landing edge as the regression above.
        const input: PlanInput = {
            ...mapAnswersToPlanInput({}).input,
            floors: 1,
        };
        const layout: AiLayout = {
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
                            rects: [{ x: 4, y: 0, w: 2, h: 2 }],
                        },
                        {
                            key: 'hall1',
                            name: 'ホール',
                            type: 'hall',
                            rects: [{ x: 2, y: 5, w: 2, h: 1 }],
                        },
                        {
                            key: 'stairs2',
                            name: '階段',
                            type: 'stairs',
                            rects: [{ x: 2, y: 2, w: 2, h: 3 }],
                        },
                        {
                            key: 'closet3',
                            name: '収納',
                            type: 'closet',
                            rects: [{ x: 0, y: 2, w: 2, h: 3 }],
                        },
                        {
                            key: 'ldk4',
                            name: 'LDK',
                            type: 'ldk',
                            rects: [{ x: 4, y: 2, w: 4, h: 4 }],
                        },
                    ],
                    doors: [
                        {
                            room: 'closet3',
                            dir: 'v',
                            pos: 2,
                            a: 3,
                            b: 4,
                            kind: 'swing',
                        },
                    ],
                },
            ],
        };

        const structural = checkAiLayout(layout, input, {
            shouldRequireDoors: true,
        });
        expect(
            structural.some((m) => m.includes('階段の側面')),
        ).toBe(true);

        const variant = VARIANTS[0];
        expect(variant).toBeDefined();
        if (!variant) return;

        const plan = planFromAiLayout(
            input,
            layout,
            variant,
            defaultPlannerConfig,
            1,
        );
        expect(findDoorOnStairsSide(plan.model)).toBeNull();
        const badWall = plan.model.floors[0]?.walls.find(
            (w) =>
                (w.a.x === w.b.x && w.a.x === 2 * 910) ||
                (w.b.x === w.a.x && w.b.x === 2 * 910),
        );
        expect(badWall).toBeDefined();
        if (badWall) {
            const hasOpening = plan.model.floors[0]?.openings.some(
                (o) => o.wallId === badWall.id,
            );
            expect(hasOpening).toBe(false);
        }
    });

    function assertNoBadStairsDoor(answers: Record<string, unknown>): void {
        for (let seed = 1; seed <= 15; seed += 1) {
            const mapped = mapAnswersToPlanInput(answers);
            const result = generatePlansSafe(
                mapped.input,
                undefined,
                undefined,
                seed,
            );
            expect(result.ok).toBe(true);
            if (!result.ok) continue;
            for (const plan of result.data.plans) {
                expect(findDoorOnStairsSide(plan.model)).toBeNull();
            }
        }
    }

    it('rule-based planner: default answers across seeds', () => {
        assertNoBadStairsDoor(getDefaultWizardAnswers());
    });

    it('rule-based planner: extra rooms (study, fam closet, 2F wash)', () => {
        const base = getDefaultWizardAnswers();
        assertNoBadStairsDoor({
            ...base,
            extraRooms: ['書斎'],
            storageOptions: ['ファミリークローゼット'],
            waterOptions: ['2階洗面', 'ランドリールーム'],
            kidsRoomCount: '3部屋',
        });
    });

    it('rule-based planner: narrow lots', () => {
        const base = getDefaultWizardAnswers();
        assertNoBadStairsDoor({
            ...base,
            frontageM: '8.5',
            depthM: '18.0',
        });
    });
});
