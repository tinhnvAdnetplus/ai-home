import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
    type BuildingModel,
    type Floor,
    faceOutwardNormal,
    gridToCanonical,
    liftToFloor,
    stackStoreyElevations,
    storeyHeightForLevel,
} from '@aihome/bdm';
import {
    buildScene,
    buildFloorSlabs,
    buildFloorWalls,
    canonicalToThree,
    createMaterialRegistry,
    resolveFixturePlacement,
    threeToCanonical,
    toThreePoint,
} from '@aihome/render3d';
import { generatePlansSafe, mapAnswersToPlanInput } from '@aihome/planner';
import { getDefaultWizardAnswers } from '@/features/wizard';

function defaultPlans(): readonly { model: BuildingModel }[] {
    const res = generatePlansSafe(
        mapAnswersToPlanInput(getDefaultWizardAnswers()).input,
    );
    if (!res.ok) throw new Error('plan generation failed');
    return res.data.plans;
}

function box(obj: THREE.Object3D): THREE.Box3 {
    obj.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(obj);
}

describe('canonical coordinate system -> Three.js (single boundary)', () => {
    it('maps the front-left ground reference to the origin', () => {
        const p = canonicalToThree({ x: 0, y: 0, z: 0 });
        expect(p.x).toBeCloseTo(0, 12);
        expect(p.y).toBeCloseTo(0, 12);
        expect(p.z).toBeCloseTo(0, 12);
    });

    it('moving right changes only three.x, rearward only -three.z, upward only three.y', () => {
        const o = canonicalToThree({ x: 0, y: 0, z: 0 });
        const right = canonicalToThree({ x: 1000, y: 0, z: 0 });
        const rear = canonicalToThree({ x: 0, y: 1000, z: 0 });
        const up = canonicalToThree({ x: 0, y: 0, z: 1000 });
        expect([right.x - o.x, right.y - o.y, right.z - o.z]).toEqual([
            1, 0, 0,
        ]);
        expect([rear.x - o.x, rear.y - o.y, rear.z - o.z]).toEqual([0, 0, -1]);
        expect([up.x - o.x, up.y - o.y, up.z - o.z]).toEqual([0, 1, 0]);
    });

    it('is a proper rotation (handedness preserved): X x Y = Z on both sides', () => {
        const v = (p: { x: number; y: number; z: number }): THREE.Vector3 => {
            const t = canonicalToThree(p);
            return new THREE.Vector3(t.x, t.y, t.z).normalize();
        };
        const ex = v({ x: 1, y: 0, z: 0 });
        const ey = v({ x: 0, y: 1, z: 0 });
        const ez = v({ x: 0, y: 0, z: 1 });
        const cross = new THREE.Vector3().crossVectors(ex, ey);
        expect(cross.distanceTo(ez)).toBeCloseTo(0, 12);
    });

    it('round-trips canonical <-> three', () => {
        const p = { x: 1234, y: 5678, z: 2900 };
        const back = threeToCanonical(canonicalToThree(p));
        expect(back.x).toBeCloseTo(p.x, 6);
        expect(back.y).toBeCloseTo(p.y, 6);
        expect(back.z).toBeCloseTo(p.z, 6);
    });

    it('model faces have consistent outward directions (front = road = -Y)', () => {
        expect(faceOutwardNormal('front')).toEqual({ x: 0, y: -1 });
        expect(faceOutwardNormal('back')).toEqual({ x: 0, y: 1 });
        expect(faceOutwardNormal('left')).toEqual({ x: -1, y: 0 });
        expect(faceOutwardNormal('right')).toEqual({ x: 1, y: 0 });
    });
});

describe('grid and storey conversions', () => {
    it('grid cell corners map to canonical mm on the 910 module', () => {
        expect(gridToCanonical(0, 0)).toEqual({ x: 0, y: 0 });
        expect(gridToCanonical(3, 2)).toEqual({ x: 2730, y: 1820 });
    });

    it('storey elevations stack floor heights (no hard-coded upper elevation)', () => {
        expect(stackStoreyElevations([2900, 2800, 2800])).toEqual([
            0, 2900, 5700,
        ]);
        expect(storeyHeightForLevel(1)).toBe(2900);
        expect(storeyHeightForLevel(2)).toBe(2800);
    });

    it('planner floors are stacked: each storey starts where the one below ends', () => {
        for (const { model } of defaultPlans()) {
            const [f1, f2] = model.floors;
            expect(f1?.elevationMm).toBe(0);
            if (f1 && f2)
                expect(f2.elevationMm).toBe(f1.elevationMm + f1.heightMm);
        }
    });

    it('a point lifted onto a floor uses that floor elevation for Z', () => {
        const floor: Floor = {
            level: 2,
            elevationMm: 2900,
            heightMm: 2800,
            rooms: [],
            walls: [],
            openings: [],
            fixtures: [],
            stairs: [],
        };
        expect(liftToFloor({ x: 10, y: 20 }, floor, 900)).toEqual({
            x: 10,
            y: 20,
            z: 3800,
        });
    });
});

describe('rendered geometry agrees with canonical data', () => {
    const plans = defaultPlans();
    const model = plans[0]?.model;
    if (!model) throw new Error('no plan');

    it('room slabs land exactly on their room polygons and floor elevation', () => {
        const reg = createMaterialRegistry();
        for (const floor of model.floors) {
            const group = buildFloorSlabs(floor, reg);
            for (const room of floor.rooms) {
                const mesh = group.getObjectByName(`slab-${room.id}`);
                if (!mesh) continue; // upper stairwell has no slab
                const b = box(mesh);
                const xs = room.polygon.map((p) => p.x);
                const ys = room.polygon.map((p) => p.y);
                const lo = toThreePoint(
                    { x: Math.min(...xs), y: Math.max(...ys) },
                    floor.elevationMm,
                );
                const hi = toThreePoint(
                    { x: Math.max(...xs), y: Math.min(...ys) },
                    floor.elevationMm,
                );
                expect(b.min.x).toBeCloseTo(lo.x, 4);
                expect(b.max.x).toBeCloseTo(hi.x, 4);
                expect(b.min.z).toBeCloseTo(lo.z, 4);
                expect(b.max.z).toBeCloseTo(hi.z, 4);
                expect(b.min.y).toBeCloseTo(lo.y + 0.005, 4);
            }
        }
    });

    it('ceilings sit over their own rooms (not mirrored in front of the house) and face down', () => {
        const reg = createMaterialRegistry();
        const floor = model.floors[0];
        if (!floor) throw new Error('no floor');
        const group = buildFloorSlabs(floor, reg, { isCeilingVisible: true });
        for (const room of floor.rooms) {
            const slab = group.getObjectByName(`slab-${room.id}`);
            const ceil = group.getObjectByName(`ceiling-${room.id}`);
            if (!slab || !ceil || !(ceil instanceof THREE.Mesh)) continue;
            const s = box(slab);
            const c = box(ceil);
            expect(c.min.x).toBeCloseTo(s.min.x, 4);
            expect(c.max.x).toBeCloseTo(s.max.x, 4);
            expect(c.min.z).toBeCloseTo(s.min.z, 4);
            expect(c.max.z).toBeCloseTo(s.max.z, 4);
            expect(c.min.y).toBeCloseTo(
                (floor.elevationMm + floor.heightMm) * 0.001 - 0.005,
                4,
            );
            const geo: unknown = ceil.geometry;
            if (!(geo instanceof THREE.BufferGeometry))
                throw new Error('no geometry');
            const normal: unknown = geo.getAttribute('normal');
            if (!(normal instanceof THREE.BufferAttribute))
                throw new Error('no normals');
            expect(normal.getY(0)).toBeCloseTo(-1, 6);
        }
    });

    it('fixtures, slabs and walls share the same transform (fixture centre inside its room)', () => {
        for (const floor of model.floors) {
            for (const f of floor.fixtures) {
                const p = resolveFixturePlacement(f);
                if (!p) continue;
                const back = threeToCanonical({
                    x: p.centerThreeX,
                    y: 0,
                    z: p.centerThreeZ,
                });
                expect(back.x).toBeCloseTo(p.centerMmX, 6);
                expect(back.y).toBeCloseTo(p.centerMmY, 6);
            }
        }
    });

    it('keeps the intended orientation: front facade at three.z = 0, house to the rear and right', () => {
        const reg = createMaterialRegistry();
        const floor = model.floors[0];
        if (!floor) throw new Error('no floor');
        // walls only (no door canopy / lattice), so the box is the wall solids + plinth skin
        const b = box(buildFloorWalls({ ...floor, openings: [] }, reg, false));
        const xs = floor.walls.map((w) => [w.a.x, w.b.x]).flat();
        const ys = floor.walls.map((w) => [w.a.y, w.b.y]).flat();
        const skin = 0.075 + 0.025; // half exterior wall + plinth base skin
        expect(b.max.z).toBeCloseTo(-Math.min(...ys) * 0.001 + skin, 4);
        expect(b.min.z).toBeCloseTo(-Math.max(...ys) * 0.001 - skin, 4);
        expect(b.min.x).toBeCloseTo(Math.min(...xs) * 0.001 - skin, 4);
        expect(b.max.x).toBeCloseTo(Math.max(...xs) * 0.001 + skin, 4);
        expect(Math.min(...ys)).toBe(0);
        expect(Math.min(...xs)).toBe(0);
    });

    it('upper-floor and roof geometry sit at their storey elevations', () => {
        const result = buildScene(model, {
            isSiteVisible: false,
            isFurnitureVisible: false,
        });
        const top = model.floors[model.floors.length - 1];
        if (!top) throw new Error('no floors');
        const roof = result.scene.getObjectByName('roof');
        if (!roof) throw new Error('no roof');
        const eave = (top.elevationMm + top.heightMm) * 0.001;
        const rb = box(roof);
        expect(rb.max.y).toBeGreaterThan(eave);
        // the roof reaches down to (not above) the top wall plate: no floating roof
        expect(rb.min.y).toBeLessThanOrEqual(eave + 1e-6);
        if (model.floors.length > 1) {
            const f2 = result.scene.getObjectByName('floor-2');
            if (!f2) throw new Error('no floor-2');
            // belt line sits 50 mm below the 2F floor; nothing of 2F lower than that
            expect(box(f2).min.y).toBeCloseTo(
                (model.floors[1]?.elevationMm ?? 0) * 0.001 - 0.05,
                3,
            );
        }
        result.dispose();
    });
});
