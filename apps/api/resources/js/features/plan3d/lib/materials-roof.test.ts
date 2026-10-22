import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { type BuildingModel, type Floor, type Roof } from '@aihome/bdm';
import {
    ARCHITECTURAL_STYLES,
    buildRoof,
    buildScene,
    createMaterialRegistry,
    resolvePalette,
    styleFromLabel,
} from '@aihome/render3d';
import {
    generatePlansSafe,
    mapAnswersToPlanInput,
    validateSolids,
} from '@aihome/planner';
import { getDefaultWizardAnswers } from '@/features/wizard';
import { resolveMaterialsFromAnswers } from '@/features/plan';

const colorOf = (m: THREE.Material): string =>
    m instanceof THREE.MeshStandardMaterial ? `#${m.color.getHexString()}` : '';

describe('semantic palette and material registry', () => {
    it('is deterministic: identical input -> identical palette and material colours', () => {
        const opts = {
            wall: '#e8dfd1',
            roof: '#5c4033',
            style: 'natural' as const,
        };
        expect(resolvePalette(opts)).toEqual(resolvePalette(opts));
        const a = createMaterialRegistry(opts);
        const b = createMaterialRegistry(opts);
        for (const key of [
            'wallExterior',
            'roof',
            'fascia',
            'frame',
            'door',
            'glass',
        ] as const) {
            expect(colorOf(a[key])).toBe(colorOf(b[key]));
        }
    });

    it('keeps explicit user colours verbatim', () => {
        const reg = createMaterialRegistry({
            wall: '#1f2e4d',
            roof: '#2e4d36',
            accent: '#c48950',
        });
        expect(colorOf(reg.wallExterior)).toBe('#1f2e4d');
        expect(colorOf(reg.roof)).toBe('#2e4d36');
        expect(colorOf(reg.wallExteriorAlt)).toBe('#c48950');
    });

    it('assigns distinct materials to distinct architectural roles (no single flat colour)', () => {
        for (const style of ARCHITECTURAL_STYLES) {
            const reg = createMaterialRegistry({ style });
            const roles = [
                reg.wallExterior,
                reg.roof,
                reg.foundation,
                reg.frame,
                reg.paving,
            ];
            expect(new Set(roles.map(colorOf)).size).toBe(roles.length);
            expect(reg.palette.style).toBe(style);
            // glazing is transparent and does not write depth; walls/roof are opaque
            expect(reg.glass.transparent).toBe(true);
            expect(reg.glass.depthWrite).toBe(false);
            expect(reg.wallExterior.transparent).toBe(false);
        }
    });

    it('derives coherent dependent slots from a chosen colour (trim follows roof, frames contrast wall)', () => {
        const p = resolvePalette({ roof: '#5c4033', wall: '#2b2b2b' });
        expect(p.trim.color).not.toBe(resolvePalette().trim.color);
        expect(p.windowFrame.color).not.toBe(
            resolvePalette().windowFrame.color,
        );
    });

    it('falls back to a light, low-saturation facade when no colour is chosen (not the old dark grey)', () => {
        for (const style of ARCHITECTURAL_STYLES) {
            const hex = resolvePalette({ style }).wall.color;
            const [r, g, b] = [1, 3, 5].map(
                (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
            );
            const max = Math.max(r ?? 0, g ?? 0, b ?? 0);
            const min = Math.min(r ?? 0, g ?? 0, b ?? 0);
            expect((max + min) / 2).toBeGreaterThan(0.75); // light
            expect(max - min).toBeLessThan(0.15); // restrained chroma
        }
        expect(resolvePalette().wall.color).not.toBe('#5f5a57');
    });

    it('maps wizard / planner style labels to palette styles', () => {
        expect(styleFromLabel('wa_modern')).toBe('japanese-modern');
        expect(styleFromLabel('和モダン')).toBe('japanese-modern');
        expect(styleFromLabel('natural')).toBe('natural');
        expect(styleFromLabel('南欧風')).toBe('south-european');
        expect(styleFromLabel(undefined)).toBe('modern');
    });

    it('the plan materials resolver passes the exterior style and explicit colours through', () => {
        const m = resolveMaterialsFromAnswers(
            {
                design_exterior_style: 'natural',
                design_exterior_wall_color: ['beige'],
            },
            undefined,
        );
        expect(m.style).toBe('natural');
        expect(m.wall).toBe('#e8dfd1');
    });

    it('geometry and validation do not depend on material choices', () => {
        const res = generatePlansSafe(
            mapAnswersToPlanInput(getDefaultWizardAnswers()).input,
        );
        if (!res.ok) throw new Error('plan generation failed');
        const first = res.data.plans.at(0);
        if (!first) throw new Error('no plan');
        const model = first.model;
        const bounds = (
            materials: Parameters<typeof createMaterialRegistry>[0],
        ) => {
            const r = buildScene(model, { materials, isSiteVisible: false });
            const b = r.bounds;
            r.dispose();
            return b;
        };
        expect(
            bounds({
                wall: '#000000',
                roof: '#ffffff',
                style: 'south-european',
            }),
        ).toEqual(bounds(undefined));
        // validation never sees materials at all: same model -> same report
        expect(validateSolids(model)).toEqual(
            validateSolids(structuredClone(model)),
        );
    });
});

// ---------- roof / wall contact ----------

const W = 7280;
const D = 5460;

function oneStorey(roof: Roof): BuildingModel {
    const floor: Floor = {
        level: 1,
        elevationMm: 0,
        heightMm: 2900,
        rooms: [],
        walls: [
            {
                id: 'f',
                a: { x: 0, y: 0 },
                b: { x: W, y: 0 },
                thicknessMm: 150,
                kind: 'exterior',
            },
            {
                id: 'r',
                a: { x: W, y: 0 },
                b: { x: W, y: D },
                thicknessMm: 150,
                kind: 'exterior',
            },
            {
                id: 'b',
                a: { x: 0, y: D },
                b: { x: W, y: D },
                thicknessMm: 150,
                kind: 'exterior',
            },
            {
                id: 'l',
                a: { x: 0, y: 0 },
                b: { x: 0, y: D },
                thicknessMm: 150,
                kind: 'exterior',
            },
        ],
        openings: [],
        fixtures: [],
        stairs: [],
    };
    return {
        schemaVersion: 1,
        meta: { generator: 'test', seed: 1, inputHash: 'x' },
        site: {
            boundary: [],
            areaM2: 0,
            road: { side: 'south', widthMm: 4000 },
            setbacks: { frontMm: 0, rearMm: 0, leftMm: 0, rightMm: 0 },
        },
        floors: [floor],
        roof,
        parking: { spaces: 0, kind: 'surface' },
        warnings: [],
    };
}

/** First hit of a ray against the roof group, every face treated as double-sided. */
function firstHit(
    group: THREE.Object3D,
    origin: THREE.Vector3,
    dir: THREE.Vector3,
): THREE.Intersection | undefined {
    group.traverse((o) => {
        if (o instanceof THREE.Mesh) {
            const material: unknown = o.material;
            const mats: unknown[] = Array.isArray(material)
                ? material
                : [material];
            for (const m of mats) {
                if (m instanceof THREE.Material) m.side = THREE.DoubleSide;
            }
        }
    });
    group.updateMatrixWorld(true);
    return new THREE.Raycaster(origin, dir.normalize()).intersectObject(
        group,
        true,
    )[0];
}

describe('roof meets its supporting walls', () => {
    const wallTop = 2.9;
    const frontFace = 0.075; // three.z of the front wall's outer face (y = -75 mm)
    const leftFace = -0.075;

    for (const kind of ['gabled', 'shed'] as const) {
        it(`${kind}: no open slot between the wall plate and the roof at the eave wall line`, () => {
            const reg = createMaterialRegistry();
            const roof = buildRoof(
                oneStorey({ kind, pitch: 4, overhangMm: 600 }),
                reg,
            );
            // from inside the attic, just above the wall plate, looking out through the front wall
            const hit = firstHit(
                roof,
                new THREE.Vector3(W * 0.0005, wallTop + 0.02, -D * 0.0005),
                new THREE.Vector3(0, 0, 1),
            );
            expect(hit).toBeDefined();
            expect(hit?.point.z).toBeCloseTo(frontFace, 3);
            reg.disposeAll();
        });
    }

    it('gabled: the gable infill is flush with the outer wall face (not set back to the centreline)', () => {
        const reg = createMaterialRegistry();
        const roof = buildRoof(
            oneStorey({ kind: 'gabled', pitch: 4, overhangMm: 600 }),
            reg,
        );
        const hit = firstHit(
            roof,
            new THREE.Vector3(W * 0.0005, wallTop + 0.5, -D * 0.0005),
            new THREE.Vector3(-1, 0, 0),
        );
        expect(hit?.point.x).toBeCloseTo(leftFace, 3);
        expect(hit?.object.name).toBe('roof-infill');
        reg.disposeAll();
    });

    it('flat: the roof finish is visible on top (the parapet is a ring, not a box over the slab)', () => {
        const reg = createMaterialRegistry();
        const roof = buildRoof(
            oneStorey({ kind: 'flat', pitch: 0, overhangMm: 300 }),
            reg,
        );
        const hit = firstHit(
            roof,
            new THREE.Vector3(W * 0.0005, 10, -D * 0.0005),
            new THREE.Vector3(0, -1, 0),
        );
        expect(hit?.object.name).toBe('roof-slab');
        const obj = hit?.object;
        expect(obj instanceof THREE.Mesh ? obj.material : null).toBe(reg.roof);
        reg.disposeAll();
    });

    it('hipped: nothing of the roof hangs below the wall plate inside the house (top ceiling stays visible)', () => {
        const reg = createMaterialRegistry();
        const roof = buildRoof(
            oneStorey({ kind: 'hipped', pitch: 4, overhangMm: 600 }),
            reg,
        );
        const hit = firstHit(
            roof,
            new THREE.Vector3(W * 0.0005, wallTop - 0.3, -D * 0.0005),
            new THREE.Vector3(0, 1, 0),
        );
        expect(hit?.point.y).toBeGreaterThan(wallTop);
        reg.disposeAll();
    });
});
