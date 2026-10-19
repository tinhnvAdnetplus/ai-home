import type * as THREE from 'three';
import { addBox } from './furniture-geom.js';
import { type MaterialRegistry, type Point3D } from './types.js';

export function buildShoesCabinet(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const h = 1.05;
    addBox(group, w, h, d, pos, reg.wallInterior, reg);
    addBox(
        group,
        w + 0.04,
        0.03,
        d + 0.04,
        { x: pos.x, y: pos.y + h, z: pos.z },
        reg.woodAccent,
        reg,
    );
}

export function buildWashitsuTable(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const h = 0.34;
    addBox(
        group,
        w,
        0.04,
        d,
        { x: pos.x, y: pos.y + h - 0.04, z: pos.z },
        reg.fixtureWood,
        reg,
    );

    const legW = 0.06;
    const offX = w / 2 - legW / 2 - 0.04;
    const offZ = d / 2 - legW / 2 - 0.04;
    const corners = [
        [-offX, -offZ],
        [offX, -offZ],
        [-offX, offZ],
        [offX, offZ],
    ] as const;
    for (const [cx, cz] of corners) {
        addBox(
            group,
            legW,
            h - 0.04,
            legW,
            { x: pos.x + cx, y: pos.y, z: pos.z + cz },
            reg.woodAccent,
            reg,
        );
    }

    const cushionW = 0.44;
    const cushionD = 0.44;
    const cushionH = 0.06;
    const cushionDistZ = d / 2 + cushionD / 2 + 0.06;
    addBox(
        group,
        cushionW,
        cushionH,
        cushionD,
        { x: pos.x, y: pos.y, z: pos.z - cushionDistZ },
        reg.fixtureFabric,
        reg,
    );
    addBox(
        group,
        cushionW,
        cushionH,
        cushionD,
        { x: pos.x, y: pos.y, z: pos.z + cushionDistZ },
        reg.fixtureFabric,
        reg,
    );
}
