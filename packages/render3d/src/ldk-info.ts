import * as THREE from 'three';
import { type Floor, type Room } from '@aihome/bdm';
import { toThreeX, toThreeY, toThreeZ } from './coords.js';
import { type Point3D } from './types.js';

export function computeFloorCenter(floor: Floor): THREE.Vector3 {
    let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
    for (const w of floor.walls) {
        minX = Math.min(minX, w.a.x, w.b.x);
        maxX = Math.max(maxX, w.a.x, w.b.x);
        minY = Math.min(minY, w.a.y, w.b.y);
        maxY = Math.max(maxY, w.a.y, w.b.y);
    }
    return new THREE.Vector3(
        toThreeX((minX + maxX) / 2),
        toThreeY(floor.elevationMm + 1400),
        toThreeZ((minY + maxY) / 2),
    );
}

export function findLdkInfo(
    floor?: Floor,
): { readonly center: Point3D; readonly facing: Point3D } | undefined {
    if (!floor) return undefined;
    const ldk = floor.rooms.find(
        (r: Room) => r.type === 'ldk' || r.type === 'living',
    );
    if (!ldk || ldk.polygon.length < 3) return undefined;

    let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
    for (const pt of ldk.polygon) {
        minX = Math.min(minX, pt.x);
        maxX = Math.max(maxX, pt.x);
        minY = Math.min(minY, pt.y);
        maxY = Math.max(maxY, pt.y);
    }
    const center = {
        x: toThreeX((minX + maxX) / 2),
        y: floor.elevationMm * 0.001 + 1.4,
        z: toThreeZ((minY + maxY) / 2),
    };
    let bestDist = Infinity;
    let facing: Point3D = { x: 0, y: 0, z: 1 };
    const windows = floor.openings.filter(
        (o) => o.kind === 'window' || o.kind === 'largeWindow',
    );
    for (const w of windows) {
        const wall = floor.walls.find((wl) => wl.id === w.wallId);
        if (!wall) continue;
        const len = Math.max(
            1,
            Math.hypot(wall.b.x - wall.a.x, wall.b.y - wall.a.y),
        );
        const ratio = (w.offsetMm + w.widthMm / 2) / len;
        const wx = toThreeX(wall.a.x + (wall.b.x - wall.a.x) * ratio);
        const wz = toThreeZ(wall.a.y + (wall.b.y - wall.a.y) * ratio);
        const d = Math.hypot(wx - center.x, wz - center.z);
        if (d < bestDist) {
            bestDist = d;
            const norm = Math.hypot(wx - center.x, wz - center.z) || 1;
            facing = {
                x: (wx - center.x) / norm,
                y: 0,
                z: (wz - center.z) / norm,
            };
        }
    }
    return { center, facing };
}
