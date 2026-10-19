import type * as THREE from 'three';
import { addBox, addCylinder } from './furniture-geom.js';
import { type MaterialRegistry, type Point3D } from './types.js';

export function buildToilet(
    group: THREE.Group,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const bowlW = 0.38;
    const bowlD = 0.52;
    const bowlH = 0.42;
    const tankW = 0.42;
    const tankD = 0.22;
    const tankH = 0.45;

    addBox(
        group,
        bowlW,
        bowlH,
        bowlD,
        { x: pos.x, y: pos.y, z: pos.z + 0.08 },
        reg.fixtureCeramic,
        reg,
    );
    addBox(
        group,
        tankW,
        tankH,
        tankD,
        { x: pos.x, y: pos.y + bowlH * 0.7, z: pos.z - bowlD / 2 + tankD / 2 },
        reg.fixtureCeramic,
        reg,
    );
    addBox(
        group,
        bowlW * 0.9,
        0.04,
        bowlD * 0.85,
        { x: pos.x, y: pos.y + bowlH, z: pos.z + 0.08 },
        reg.wallInterior,
        reg,
    );
}

export function buildWashbasin(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const vanityH = 0.8;
    const basinW = Math.min(w * 0.65, 0.52);
    const basinD = Math.min(d * 0.65, 0.38);
    const mirrorW = Math.min(w * 0.88, 0.9);

    addBox(group, w, vanityH, d, pos, reg.wallInterior, reg);
    addBox(
        group,
        w + 0.02,
        0.03,
        d + 0.02,
        { x: pos.x, y: pos.y + vanityH, z: pos.z },
        reg.fixtureCounter,
        reg,
    );
    addBox(
        group,
        basinW,
        0.015,
        basinD,
        { x: pos.x, y: pos.y + vanityH + 0.03, z: pos.z },
        reg.fixtureCeramic,
        reg,
    );
    addBox(
        group,
        mirrorW,
        0.75,
        0.04,
        { x: pos.x, y: pos.y + 1.25, z: pos.z - d / 2 + 0.02 },
        reg.glass,
        reg,
    );
}

export function buildWashingMachine(
    group: THREE.Group,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const w = 0.62;
    const d = 0.62;
    const h = 0.96;

    addBox(group, w, h, d, pos, reg.wallInterior, reg);
    addCylinder(
        group,
        0.2,
        0.2,
        0.02,
        16,
        { x: pos.x, y: pos.y + h * 0.5, z: pos.z + d / 2 + 0.01 },
        reg.curb,
        reg,
    );
    addBox(
        group,
        w * 0.85,
        0.12,
        0.02,
        { x: pos.x, y: pos.y + h * 0.82, z: pos.z + d / 2 + 0.01 },
        reg.fascia,
        reg,
    );
}

export function buildBathtub(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const tubH = 0.58;
    addBox(group, w, tubH, d, pos, reg.wallInterior, reg);
    addBox(
        group,
        w - 0.16,
        0.02,
        d - 0.16,
        { x: pos.x, y: pos.y + tubH - 0.08, z: pos.z },
        reg.curb,
        reg,
    );
    addCylinder(
        group,
        0.02,
        0.02,
        0.15,
        8,
        { x: pos.x - w / 2 + 0.12, y: pos.y + tubH, z: pos.z },
        reg.doorHandle,
        reg,
    );
}
