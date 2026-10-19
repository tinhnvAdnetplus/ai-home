import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
    resolveFixturePlacement,
    groupFixturesByRoom,
    toThreeX,
    toThreeZ,
} from '@aihome/render3d';
import { type Fixture, type Room } from '@aihome/bdm';

describe('resolveFixturePlacement: BDM rotation -> THREE.rotation.y', () => {
    it('matches THREE.js own rotateY math exactly (no sign flip needed, unlike the 2D mirror)', () => {
        // An asymmetric BDM point, rotated 3 ways and converted to Three units: (a) rotate in
        // BDM (X,Y-down) space by theta, THEN convert to Three; (b) convert to Three first, THEN
        // rotate with THREE's own Object3D.rotateY (the exact thing the renderer does via
        // `sub.rotation.y = ...`). The two must agree, or the computed `rotationDeg` would spin
        // every rotated fixture the wrong way in the 3D view.
        const x = 1500;
        const y = 400;
        const cx = 1000;
        const cy = 1000;
        const thetaDeg = 90;

        // (a) rotate in BDM space (clockwise, Y-down — same convention as the 2D SVG rotate()).
        const th = (thetaDeg * Math.PI) / 180;
        const dx = x - cx;
        const dy = y - cy;
        const rotatedX = cx + (dx * Math.cos(th) - dy * Math.sin(th));
        const rotatedY = cy + (dx * Math.sin(th) + dy * Math.cos(th));
        const pathA = new THREE.Vector3(
            toThreeX(rotatedX),
            0,
            toThreeZ(rotatedY),
        );

        // (b) convert to Three first, then rotate with THREE's real rotateY around the Three
        // pivot — exactly the operation `fixture-dispatch.ts` performs via `sub.rotation.y`.
        const point = new THREE.Vector3(toThreeX(x), 0, toThreeZ(y));
        const pivot = new THREE.Vector3(toThreeX(cx), 0, toThreeZ(cy));
        const obj = new THREE.Object3D();
        obj.position.copy(pivot);
        obj.rotation.y = (thetaDeg * Math.PI) / 180; // what fixture-dispatch.ts computes
        const local = point.clone().sub(pivot);
        const pathB = local
            .applyEuler(new THREE.Euler(0, obj.rotation.y, 0))
            .add(pivot);

        expect(pathA.x).toBeCloseTo(pathB.x, 9);
        expect(pathA.z).toBeCloseTo(pathB.z, 9);
    });

    it('swaps width/height for the rotated footprint used to find the center', () => {
        const fixture: Fixture = {
            id: 'f1',
            kind: 'bed_double',
            pos: { x: 1000, y: 2000 },
            rotation: 90,
        };
        const placement = resolveFixturePlacement(fixture);
        expect(placement).not.toBeNull();
        if (!placement) return;
        // bed_double is 1500x2000mm; rotated 90 the footprint is 2000x1500, so center =
        // pos + (2000,1500)/2 = (1000+1000, 2000+750) = (2000, 2750).
        expect(placement.centerMmX).toBe(2000);
        expect(placement.centerMmY).toBe(2750);
        // the builder itself still gets the NATURAL (unrotated) size — rotation is applied by
        // the wrapping group, not by stretching the mesh.
        expect(placement.widthM).toBeCloseTo(1.5);
        expect(placement.depthM).toBeCloseTo(2.0);
    });

    it('returns null for an unrecognized kind instead of throwing', () => {
        const fixture: Fixture = {
            id: 'f1',
            kind: 'some_future_kind',
            pos: { x: 0, y: 0 },
            rotation: 0,
        };
        expect(resolveFixturePlacement(fixture)).toBeNull();
    });
});

describe('groupFixturesByRoom', () => {
    function square(x0: number, y0: number, x1: number, y1: number) {
        return [
            { x: x0, y: y0 },
            { x: x1, y: y0 },
            { x: x1, y: y1 },
            { x: x0, y: y1 },
        ];
    }

    it('assigns each fixture to the room whose polygon contains its center', () => {
        const rooms: Room[] = [
            {
                id: 'room-a',
                type: 'bedroom',
                name: 'A',
                polygon: square(0, 0, 3000, 3000),
                areaM2: 9,
            },
            {
                id: 'room-b',
                type: 'ldk',
                name: 'B',
                polygon: square(3000, 0, 9000, 3000),
                areaM2: 18,
            },
        ];
        const fixtures: Fixture[] = [
            { id: 'bed', kind: 'bed_double', pos: { x: 500, y: 500 }, rotation: 0 },
            { id: 'sofa', kind: 'sofa', pos: { x: 4000, y: 500 }, rotation: 0 },
        ];
        const byRoom = groupFixturesByRoom(rooms, fixtures);
        expect(byRoom.get('room-a')?.map((f) => f.id)).toEqual(['bed']);
        expect(byRoom.get('room-b')?.map((f) => f.id)).toEqual(['sofa']);
    });

    it('drops a fixture whose center lands outside every room', () => {
        const rooms: Room[] = [
            {
                id: 'room-a',
                type: 'bedroom',
                name: 'A',
                polygon: square(0, 0, 2000, 2000),
                areaM2: 4,
            },
        ];
        const fixtures: Fixture[] = [
            { id: 'stray', kind: 'desk', pos: { x: 9000, y: 9000 }, rotation: 0 },
        ];
        const byRoom = groupFixturesByRoom(rooms, fixtures);
        expect(byRoom.size).toBe(0);
    });
});
