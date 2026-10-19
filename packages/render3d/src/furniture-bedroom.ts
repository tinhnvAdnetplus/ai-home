import type * as THREE from 'three';
import { addBox } from './furniture-geom.js';
import { type MaterialRegistry, type Point3D } from './types.js';

export function buildBed(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    isDouble: boolean,
    reg: MaterialRegistry,
): void {
    const frameH = 0.28;
    const headH = 0.88;
    const headD = 0.08;
    const matH = 0.24;
    const matW = w - 0.08;
    const matD = d - headD - 0.06;

    addBox(group, w, frameH, d, pos, reg.fixtureWood, reg);
    addBox(
        group,
        w + 0.04,
        headH,
        headD,
        { x: pos.x, y: pos.y, z: pos.z - d / 2 + headD / 2 },
        reg.fixtureWood,
        reg,
    );
    addBox(
        group,
        matW,
        matH,
        matD,
        { x: pos.x, y: pos.y + frameH, z: pos.z + headD / 2 },
        reg.wallInterior,
        reg,
    );

    const duvetD = matD * 0.58;
    addBox(
        group,
        matW,
        0.05,
        duvetD,
        {
            x: pos.x,
            y: pos.y + frameH + matH,
            z: pos.z + headD / 2 + matD / 2 - duvetD / 2,
        },
        reg.fixtureFabric,
        reg,
    );

    const pillowW = isDouble ? (matW - 0.16) / 2 : matW * 0.65;
    const pillowD = 0.36;
    const pillowH = 0.09;
    const pillowZ = pos.z - d / 2 + headD + pillowD / 2 + 0.06;
    const offsets = isDouble ? [-pillowW / 2 - 0.04, pillowW / 2 + 0.04] : [0];

    for (const offX of offsets) {
        addBox(
            group,
            pillowW,
            pillowH,
            pillowD,
            { x: pos.x + offX, y: pos.y + frameH + matH, z: pillowZ },
            reg.wallInterior,
            reg,
        );
    }
}

export function buildWardrobe(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const h = 2.05;
    addBox(group, w, h, d, pos, reg.wallInterior, reg);
    addBox(
        group,
        w * 0.96,
        h * 0.96,
        0.02,
        { x: pos.x, y: pos.y + 0.04, z: pos.z + d / 2 + 0.01 },
        reg.paving,
        reg,
    );
}

export function buildNightstand(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const h = 0.55;
    addBox(group, w, h, d, pos, reg.fixtureWood, reg);
    addBox(
        group,
        w * 0.9,
        h * 0.28,
        0.02,
        { x: pos.x, y: pos.y + h * 0.5, z: pos.z + d / 2 + 0.01 },
        reg.woodAccent,
        reg,
    );
}

export function buildStudyDesk(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const h = 0.72;
    addBox(
        group,
        w,
        0.04,
        d,
        { x: pos.x, y: pos.y + h - 0.04, z: pos.z },
        reg.woodAccent,
        reg,
    );
    addBox(
        group,
        0.36,
        h - 0.04,
        d * 0.9,
        { x: pos.x + w / 2 - 0.2, y: pos.y, z: pos.z },
        reg.wallInterior,
        reg,
    );
    addBox(
        group,
        0.04,
        h - 0.04,
        d * 0.9,
        { x: pos.x - w / 2 + 0.04, y: pos.y, z: pos.z },
        reg.fixtureWood,
        reg,
    );
    addBox(
        group,
        0.42,
        0.44,
        0.42,
        { x: pos.x - 0.1, y: pos.y, z: pos.z + d / 2 + 0.25 },
        reg.fixtureFabric,
        reg,
    );
}
