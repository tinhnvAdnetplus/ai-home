import * as THREE from 'three';
import { type Floor } from '@aihome/bdm';
import { computeSegmentAngle, toThreeY } from './coords.js';
import { buildFloorSlabs } from './floor-builder.js';
import { type MaterialRegistry } from './types.js';
import { addWallPlinth, createSegmentMesh } from './wall-segment.js';

export function buildPaleBaseFloor(
    floor: Floor,
    reg: MaterialRegistry,
): THREE.Group {
    const group = new THREE.Group();
    group.name = `pale-base-floor-${String(floor.level)}`;

    group.add(buildFloorSlabs(floor, reg, { isCeilingVisible: false }));

    const elevM = toThreeY(floor.elevationMm);
    const floorHM = (floor.heightMm > 0 ? floor.heightMm : 2800) * 0.001;

    for (const wall of floor.walls) {
        if (wall.kind !== 'exterior') continue;
        const dx = wall.b.x - wall.a.x;
        const dy = wall.b.y - wall.a.y;
        const lenMm = Math.hypot(dx, dy);
        if (lenMm < 1) continue;

        const rotY = computeSegmentAngle(dx * 0.001, -dy * 0.001);
        const thickM = (wall.thicknessMm > 0 ? wall.thicknessMm : 150) * 0.001;

        if (floor.level === 1) {
            addWallPlinth(wall, rotY, lenMm, thickM, group, reg);
        }

        const wallMesh = createSegmentMesh(
            0,
            lenMm,
            elevM,
            floorHM,
            thickM,
            wall,
            rotY,
            lenMm,
            reg.wallExteriorAlt,
            reg,
        );
        if (wallMesh) {
            group.add(wallMesh);
        }
    }

    return group;
}
