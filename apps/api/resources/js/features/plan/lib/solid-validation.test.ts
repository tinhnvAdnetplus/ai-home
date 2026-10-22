import { describe, it, expect } from 'vitest';
import {
    type BuildingModel,
    type Fixture,
    type Floor,
    type Opening,
    type Room,
    type Stair,
    type Wall,
    classifyBoxes,
    classifyRects,
    resolveWallSpans,
    wallSolidRect,
} from '@aihome/bdm';
import {
    generatePlansSafe,
    mapAnswersToPlanInput,
    planFromAiLayout,
    defaultPlannerConfig,
    validateSolids,
    keepTreeOffBuilding,
    VARIANTS,
    type AiLayout,
    type PlanInput,
} from '@aihome/planner';
import { getDefaultWizardAnswers } from '@/features/wizard';

// ---------- tiny BDM factory (canonical mm, origin front-left, +y to the rear) ----------

const rect = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
): Room['polygon'] => [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
];

const room = (id: string, type: Room['type'], poly: Room['polygon']): Room => ({
    id,
    type,
    name: id,
    polygon: poly,
    areaM2: 0,
});

const wall = (
    id: string,
    a: [number, number],
    b: [number, number],
    kind: Wall['kind'] = 'interior',
): Wall => ({
    id,
    a: { x: a[0], y: a[1] },
    b: { x: b[0], y: b[1] },
    thicknessMm: kind === 'exterior' ? 150 : 100,
    kind,
});

/** 5460 x 3640 box with an interior wall at x = 2730 splitting it into two rooms. */
function boxFloor(level: number, overrides: Partial<Floor> = {}): Floor {
    const W = 5460;
    const D = 3640;
    return {
        level,
        elevationMm: level === 1 ? 0 : 2900,
        heightMm: level === 1 ? 2900 : 2800,
        rooms: [
            room(`L${level.toString()}-a`, 'bedroom', rect(0, 0, 2730, D)),
            room(`L${level.toString()}-b`, 'hall', rect(2730, 0, W, D)),
        ],
        walls: [
            wall(`w${level.toString()}-front`, [0, 0], [W, 0], 'exterior'),
            wall(`w${level.toString()}-right`, [W, 0], [W, D], 'exterior'),
            wall(`w${level.toString()}-back`, [0, D], [W, D], 'exterior'),
            wall(`w${level.toString()}-left`, [0, 0], [0, D], 'exterior'),
            wall(`w${level.toString()}-mid`, [2730, 0], [2730, D]),
        ],
        openings: [],
        fixtures: [],
        stairs: [],
        ...overrides,
    };
}

function model(
    floors: Floor[],
    extra: Partial<BuildingModel> = {},
): BuildingModel {
    return {
        schemaVersion: 1,
        meta: { generator: 'test', seed: 1, inputHash: 'test' },
        site: {
            boundary: rect(-2000, -3000, 9000, 9000),
            areaM2: 120,
            road: { side: 'south', widthMm: 4000 },
            setbacks: {
                frontMm: 1000,
                rearMm: 1000,
                leftMm: 500,
                rightMm: 500,
            },
        },
        floors,
        roof: { kind: 'gabled', pitch: 4, overhangMm: 600 },
        parking: { spaces: 0, kind: 'surface' },
        warnings: [],
        ...extra,
    };
}

const codes = (m: BuildingModel): string[] =>
    validateSolids(m).findings.map((f) => f.code);

// ---------- relationship primitives ----------

describe('solid relationships: disjoint / contact / penetration / insufficient', () => {
    const a = { minX: 0, maxX: 1000, minY: 0, maxY: 1000, minZ: 0, maxZ: 1000 };

    it('separated by a positive gap -> disjoint', () => {
        const b = { ...a, minX: 1100, maxX: 2000 };
        expect(classifyBoxes(a, b)).toEqual({
            relation: 'disjoint',
            depthMm: -100,
        });
    });

    it('touching at a face -> contact, not collision', () => {
        const b = { ...a, minX: 1000, maxX: 2000 };
        expect(classifyBoxes(a, b).relation).toBe('contact');
    });

    it('interiors intersecting -> penetration with depth', () => {
        const b = { ...a, minX: 900, maxX: 2000 };
        expect(classifyBoxes(a, b)).toEqual({
            relation: 'penetration',
            depthMm: 100,
        });
    });

    it('stacked along Z: a box resting on another is contact; sinking into it is penetration', () => {
        expect(
            classifyBoxes(a, { ...a, minZ: 1000, maxZ: 2000 }).relation,
        ).toBe('contact');
        expect(classifyBoxes(a, { ...a, minZ: 950, maxZ: 2000 }).relation).toBe(
            'penetration',
        );
    });

    it('plan overlap with an unknown vertical extent -> insufficient, never a false pass', () => {
        const b = { ...a, minX: 500, minZ: null, maxZ: null };
        expect(classifyBoxes(a, b).relation).toBe('insufficient');
        // ...but plan-disjoint is decidable without Z
        expect(
            classifyBoxes(a, { ...b, minX: 1500, maxX: 2000 }).relation,
        ).toBe('disjoint');
    });

    it('2D classification uses the same tolerance', () => {
        expect(
            classifyRects(a, { ...a, minX: 1000.5, maxX: 2000 }).relation,
        ).toBe('contact');
    });
});

// ---------- wall junctions (no duplicate / overlapping wall solids) ----------

describe('wall junction spans', () => {
    const floor = boxFloor(1);
    const spans = resolveWallSpans(floor.walls);
    const solid = (id: string) => {
        const w = floor.walls.find((x) => x.id === id);
        const s = spans.get(id);
        if (!w || !s) throw new Error(id);
        const r = wallSolidRect(w, s);
        if (!r) throw new Error(id);
        return r;
    };

    it('closes the outer L corner: front wall reaches the outer face of the side wall', () => {
        expect(solid('w1-front').minX).toBe(-75);
        expect(solid('w1-left').minX).toBe(-75);
        // the side wall stops at the front wall's inner face: face contact, no overlap
        expect(solid('w1-left').minY).toBe(75);
        expect(
            classifyRects(solid('w1-front'), solid('w1-left')).relation,
        ).toBe('contact');
    });

    it('trims a T-joint stem to the face of the wall it abuts', () => {
        const mid = solid('w1-mid');
        expect(mid.minY).toBe(75);
        expect(mid.maxY).toBe(3640 - 75);
        expect(classifyRects(mid, solid('w1-front')).relation).toBe('contact');
        expect(classifyRects(mid, solid('w1-back')).relation).toBe('contact');
    });

    it('a + joint keeps the dominant pair continuous and trims the other pair', () => {
        const walls = [
            wall('h1', [0, 1000], [1000, 1000]),
            wall('h2', [1000, 1000], [2000, 1000]),
            wall('v1', [1000, 0], [1000, 1000]),
            wall('v2', [1000, 1000], [1000, 2000]),
        ];
        const s = resolveWallSpans(walls);
        expect(s.get('h1')).toEqual({ startMm: 0, endMm: 1000 });
        expect(s.get('v1')).toEqual({ startMm: 0, endMm: 950 });
        expect(s.get('v2')).toEqual({ startMm: 50, endMm: 1000 });
    });

    it('adjacent rooms share one partition: the box floor has no overlapping wall solids', () => {
        expect(codes(model([floor]))).toEqual([]);
    });

    it('flags a duplicated partition generated twice from a shared boundary', () => {
        const dup = boxFloor(1, {
            walls: [
                ...boxFloor(1).walls,
                wall('w1-mid-dup', [2730, 0], [2730, 3640]),
            ],
        });
        expect(codes(model([dup]))).toContain('SOLID_WALL_DUPLICATE');
    });
});

// ---------- fixtures, openings ----------

const bed = (id: string, x: number, y: number): Fixture => ({
    id,
    kind: 'bed_single', // 1050 x 1950
    pos: { x, y },
    rotation: 0,
});

describe('fixtures against walls, each other and doors', () => {
    it('furniture penetrating a wall is reported with its depth', () => {
        // flush with the left wall centreline: 75 mm inside the exterior wall solid
        const m = model([boxFloor(1, { fixtures: [bed('bed', 0, 500)] })]);
        const f = validateSolids(m).findings.find(
            (x) => x.code === 'SOLID_FIXTURE_WALL_PENETRATION',
        );
        expect(f?.objectIds).toEqual(['bed', 'w1-left']);
        expect(f?.depthMm).toBe(75);
    });

    it('furniture standing against the wall face is a valid contact', () => {
        const m = model([boxFloor(1, { fixtures: [bed('bed', 75, 500)] })]);
        expect(codes(m)).toEqual([]);
    });

    it('two fixtures overlapping on the same floor are a volumetric collision', () => {
        const m = model([
            boxFloor(1, {
                fixtures: [bed('b1', 200, 200), bed('b2', 1000, 200)],
            }),
        ]);
        expect(codes(m)).toContain('SOLID_FIXTURE_OVERLAP');
    });

    it('two fixtures side by side touching are fine', () => {
        const m = model([
            boxFloor(1, {
                fixtures: [bed('b1', 200, 200), bed('b2', 1250, 200)],
            }),
        ]);
        expect(codes(m)).not.toContain('SOLID_FIXTURE_OVERLAP');
    });

    it('a fixture in the swing zone of a door is reported (info: swing side is assumed)', () => {
        const door: Opening = {
            id: 'd1',
            wallId: 'w1-mid',
            offsetMm: 1500, // y 1500..2300 along x = 2730
            widthMm: 800,
            heightMm: 2000,
            sillMm: 0,
            kind: 'door',
        };
        // the bedroom side (x < 2730) is where the door swings (hall = circulation)
        const m = model([
            boxFloor(1, {
                openings: [door],
                fixtures: [bed('bed', 1600, 1000)],
            }),
        ]);
        const report = validateSolids(m);
        expect(report.findings.map((f) => f.code)).toContain(
            'SOLID_FIXTURE_IN_DOOR_ZONE',
        );
        expect(
            report.issues.find((i) => i.code === 'SOLID_FIXTURE_IN_DOOR_ZONE')
                ?.level,
        ).toBe('info');
    });

    it('a window inside its host wall is an allowed relationship, not a collision', () => {
        const win: Opening = {
            id: 'win',
            wallId: 'w1-front',
            offsetMm: 900,
            widthMm: 900,
            heightMm: 900,
            sillMm: 900,
            kind: 'window',
        };
        const base = validateSolids(model([boxFloor(1)]));
        const withWin = validateSolids(
            model([boxFloor(1, { openings: [win] })]),
        );
        expect(withWin.findings).toEqual([]);
        expect(withWin.allowedContacts).toBe(base.allowedContacts + 1);
    });

    it('an opening taller than its storey, or cut into a crossing wall, is reported', () => {
        const tooTall: Opening = {
            id: 'tall',
            wallId: 'w1-front',
            offsetMm: 900,
            widthMm: 900,
            heightMm: 2600,
            sillMm: 900,
            kind: 'window',
        };
        const atJunction: Opening = {
            id: 'corner',
            wallId: 'w1-left',
            offsetMm: 0, // starts inside the front wall's thickness
            widthMm: 900,
            heightMm: 900,
            sillMm: 900,
            kind: 'window',
        };
        const c = codes(
            model([boxFloor(1, { openings: [tooTall, atJunction] })]),
        );
        expect(c).toContain('SOLID_OPENING_EXCEEDS_STOREY');
        expect(c).toContain('SOLID_OPENING_AT_JUNCTION');
    });

    it('an unknown fixture kind gives an incomplete-validation note instead of a pass', () => {
        const report = validateSolids(
            model([
                boxFloor(1, {
                    fixtures: [
                        {
                            id: 'x',
                            kind: 'piano',
                            pos: { x: 500, y: 500 },
                            rotation: 0,
                        },
                    ],
                }),
            ]),
        );
        expect(report.findings).toEqual([]);
        expect(report.incomplete.some((s) => s.includes('piano'))).toBe(true);
        expect(report.isApproximate).toBe(true);
    });
});

// ---------- vertical relationships ----------

const stair = (level: number): Stair => ({
    id: `stair-${level.toString()}`,
    polygon: rect(3640, 0, 5460, 2730),
    direction: 'uturn-y1',
    steps: 14,
    upFloor: level + 1,
    downFloor: level,
});

function twoStorey(f2: Partial<Floor> = {}): BuildingModel {
    const withStairRoom = (level: number): Floor =>
        boxFloor(level, {
            rooms: [
                room(
                    `L${level.toString()}-a`,
                    'bedroom',
                    rect(0, 0, 2730, 3640),
                ),
                room(
                    `L${level.toString()}-b`,
                    'hall',
                    rect(2730, 0, 3640, 3640),
                ),
                room(
                    `L${level.toString()}-s`,
                    'stairs',
                    rect(3640, 0, 5460, 2730),
                ),
                room(
                    `L${level.toString()}-c`,
                    'hall',
                    rect(3640, 2730, 5460, 3640),
                ),
            ],
        });
    return model([
        { ...withStairRoom(1), stairs: [stair(1)] },
        { ...withStairRoom(2), ...f2 },
    ]);
}

describe('storeys, stairs and roof', () => {
    it('a stair meeting its floor and landing in the upper stairwell is valid', () => {
        expect(codes(twoStorey())).toEqual([]);
    });

    it('upper-floor geometry at the wrong elevation is reported (gap and overlap)', () => {
        expect(codes(twoStorey({ elevationMm: 3000 }))).toEqual(
            expect.arrayContaining([
                'SOLID_STOREY_STACK_GAP',
                'SOLID_STAIR_LEVEL_MISMATCH',
            ]),
        );
        expect(codes(twoStorey({ elevationMm: 2700 }))).toContain(
            'SOLID_STOREY_STACK_OVERLAP',
        );
    });

    it('a stair with no stairwell above runs into the upper slab', () => {
        const m = twoStorey({ rooms: boxFloor(2).rooms });
        expect(codes(m)).toContain('SOLID_STAIR_HITS_UPPER_SLAB');
    });

    it('overlapping room slabs (coplanar -> z-fighting) are reported', () => {
        const f = boxFloor(1, {
            rooms: [
                ...boxFloor(1).rooms,
                room('dup', 'closet', rect(0, 0, 910, 910)),
            ],
        });
        expect(codes(model([f]))).toContain('SOLID_SLAB_OVERLAP');
    });

    it('the roof bears on the top-storey walls; a top storey without exterior walls is flagged', () => {
        expect(codes(model([boxFloor(1)]))).not.toContain(
            'SOLID_ROOF_UNSUPPORTED',
        );
        const bare = boxFloor(1, { walls: [] });
        expect(codes(model([bare]))).toContain('SOLID_ROOF_UNSUPPORTED');
    });

    it('a tree canopy reaching into the building is reported; tree heights are declared unchecked', () => {
        const report = validateSolids(
            model([boxFloor(1)], {
                exterior: {
                    trees: [{ pos: { x: 2000, y: 4000 }, radiusMm: 850 }],
                },
            }),
        );
        expect(report.findings.map((f) => f.code)).toContain(
            'SOLID_SITE_TREE_HITS_BUILDING',
        );
        expect(report.incomplete.some((s) => s.includes('樹高'))).toBe(true);
    });

    it('a deck fixed to the outer face of the wall is allowed; one reaching inside is not', () => {
        const attached = model([boxFloor(1)], {
            exterior: { deckPolygon: rect(0, 3640, 2730, 5460) },
        });
        expect(codes(attached)).toEqual([]);
        const inside = model([boxFloor(1)], {
            exterior: { deckPolygon: rect(0, 3000, 2730, 5460) },
        });
        expect(codes(inside)).toContain('SOLID_SITE_DECK_OVERLAPS_BUILDING');
    });
});

// ---------- planner integration ----------

describe('planner output is solid-consistent', () => {
    it('default rule-based plans have no wall penetration, fixture overlap or duplicate walls', () => {
        const res = generatePlansSafe(
            mapAnswersToPlanInput(getDefaultWizardAnswers()).input,
        );
        expect(res.ok).toBe(true);
        if (!res.ok) return;
        for (const plan of res.data.plans) {
            const c = codes(plan.model);
            for (const bad of [
                'SOLID_FIXTURE_WALL_PENETRATION',
                'SOLID_FIXTURE_OVERLAP',
                'SOLID_FIXTURE_OUTSIDE_HOST',
                'SOLID_WALL_DUPLICATE',
                'SOLID_WALL_OVERLAP',
                'SOLID_WALL_CROSSING',
                'SOLID_STOREY_STACK_GAP',
                'SOLID_STOREY_STACK_OVERLAP',
                'SOLID_SLAB_OVERLAP',
            ]) {
                expect(c).not.toContain(bad);
            }
            // solid findings are surfaced as warnings, never as hard errors
            const solidIssues = plan.warnings.filter((w) =>
                w.code.startsWith('SOLID_'),
            );
            expect(solidIssues.every((w) => w.level !== 'error')).toBe(true);
        }
    });

    it('validation is repeatable: identical input gives identical findings', () => {
        const input = mapAnswersToPlanInput(getDefaultWizardAnswers()).input;
        const a = generatePlansSafe(input);
        const b = generatePlansSafe(input);
        if (!a.ok || !b.ok) throw new Error('generation failed');
        expect(a.data.plans.map((p) => validateSolids(p.model))).toEqual(
            b.data.plans.map((p) => validateSolids(p.model)),
        );
    });

    it('an AI fixture placed flush on a wall grid line is backed against the wall face', () => {
        const layout: AiLayout = {
            gridW: 8,
            floors: [
                {
                    level: 1,
                    gridD: 6,
                    rooms: [
                        {
                            key: 'ent',
                            name: '玄関',
                            type: 'entrance',
                            rects: [{ x: 0, y: 0, w: 2, h: 2 }],
                        },
                        {
                            key: 'hall',
                            name: 'ホール',
                            type: 'hall',
                            rects: [{ x: 0, y: 2, w: 2, h: 4 }],
                        },
                        {
                            key: 'bed',
                            name: '主寝室',
                            type: 'bedroom',
                            rects: [{ x: 2, y: 0, w: 6, h: 6 }],
                        },
                    ],
                    doors: [
                        {
                            room: 'bed',
                            dir: 'v',
                            pos: 2,
                            a: 3,
                            b: 4,
                            kind: 'swing',
                        },
                    ],
                    // cell box x 7..8 touches the right exterior wall (x = gridW)
                    fixtures: [
                        {
                            room: 'bed',
                            kind: 'nightstand',
                            x: 7,
                            y: 0,
                            rotation: 0,
                        },
                    ],
                },
            ],
        };
        const input: PlanInput = {
            ...mapAnswersToPlanInput(getDefaultWizardAnswers()).input,
            floors: 1,
        };
        const variant = VARIANTS[0];
        if (!variant) throw new Error('no variant');
        const plan = planFromAiLayout(
            input,
            layout,
            variant,
            defaultPlannerConfig,
            1,
        );
        const stand = plan.model.floors[0]?.fixtures[0];
        // 450 mm nightstand in the corner cell 6370..7280 / 0..910 (gridW 8 = 7280 mm): off the
        // right wall (7280 - 75 - 10 - 450) and off the front wall (75 + 10)
        expect(stand?.pos).toEqual({ x: 7280 - 85 - 450, y: 85 });
        const c = codes(plan.model);
        expect(c).not.toContain('SOLID_FIXTURE_WALL_PENETRATION');
    });

    it('trees are kept off the building by the exterior converter', () => {
        const house = { widthMm: 7280, depthMm: 5460 };
        const lot = { minX: -500, maxX: 9500, minY: -3000, maxY: 9000 };
        const moved = keepTreeOffBuilding(
            { pos: { x: 2000, y: 5800 }, radiusMm: 850 },
            house,
            lot,
        );
        expect(moved?.pos).toEqual({ x: 2000, y: 5460 + 75 + 150 + 850 });
        expect(
            keepTreeOffBuilding(
                { pos: { x: 2000, y: 2000 }, radiusMm: 850 },
                house,
                lot,
            ),
        ).toBeNull();
        const clear = { pos: { x: 2000, y: 7500 }, radiusMm: 850 };
        expect(keepTreeOffBuilding(clear, house, lot)).toBe(clear);
    });
});
