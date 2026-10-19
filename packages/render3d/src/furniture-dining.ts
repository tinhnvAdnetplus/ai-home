import type * as THREE from 'three';
import { addBox, addLeggedTable } from './furniture-geom.js';
import { type MaterialRegistry, type Point3D } from './types.js';

export function buildDiningChair(
    group: THREE.Group,
    pos: Point3D,
    facing: 'north' | 'south',
    reg: MaterialRegistry,
): void {
    const seatW = 0.44;
    const seatD = 0.42;
    const seatH = 0.44;
    addBox(
        group,
        seatW,
        0.04,
        seatD,
        { x: pos.x, y: pos.y + seatH, z: pos.z },
        reg.fixtureFabric,
        reg,
    );

    const legW = 0.035;
    const offX = seatW / 2 - legW / 2;
    const offZ = seatD / 2 - legW / 2;
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
            seatH,
            legW,
            { x: pos.x + cx, y: pos.y, z: pos.z + cz },
            reg.fixtureWood,
            reg,
        );
    }

    const backZ = facing === 'south' ? pos.z - offZ : pos.z + offZ;
    addBox(
        group,
        seatW,
        0.38,
        0.03,
        { x: pos.x, y: pos.y + seatH + 0.04, z: backZ },
        reg.fixtureWood,
        reg,
    );
}

export function buildDiningSet(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    addLeggedTable(
        group,
        w,
        0.72,
        d,
        pos,
        reg.fixtureWood,
        reg.woodAccent,
        reg,
    );

    const chairSpacing = Math.min(w * 0.48, 0.55);
    const chairDistZ = d / 2 + 0.28;

    buildDiningChair(
        group,
        { x: pos.x - chairSpacing / 2, y: pos.y, z: pos.z - chairDistZ },
        'south',
        reg,
    );
    buildDiningChair(
        group,
        { x: pos.x + chairSpacing / 2, y: pos.y, z: pos.z - chairDistZ },
        'south',
        reg,
    );
    buildDiningChair(
        group,
        { x: pos.x - chairSpacing / 2, y: pos.y, z: pos.z + chairDistZ },
        'north',
        reg,
    );
    buildDiningChair(
        group,
        { x: pos.x + chairSpacing / 2, y: pos.y, z: pos.z + chairDistZ },
        'north',
        reg,
    );
}
