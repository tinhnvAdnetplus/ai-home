import type * as THREE from 'three';
import { addBox, addCylinder } from './furniture-geom.js';
import { type MaterialRegistry, type Point3D } from './types.js';

export function buildKitchenRun(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const counterH = 0.86;
    addBox(group, w, counterH, d, pos, reg.wallInterior, reg);
    addBox(
        group,
        w,
        0.04,
        d,
        { x: pos.x, y: pos.y + counterH, z: pos.z },
        reg.fixtureCounter,
        reg,
    );

    const sinkW = 0.6;
    const sinkD = 0.42;
    const sinkX = pos.x - w * 0.22;
    addBox(
        group,
        sinkW,
        0.01,
        sinkD,
        { x: sinkX, y: pos.y + counterH + 0.04, z: pos.z },
        reg.curb,
        reg,
    );
    addCylinder(
        group,
        0.015,
        0.015,
        0.22,
        8,
        { x: sinkX, y: pos.y + counterH + 0.04, z: pos.z - sinkD * 0.35 },
        reg.doorHandle,
        reg,
    );

    const stoveW = 0.58;
    const stoveD = 0.48;
    const stoveX = pos.x + w * 0.24;
    addBox(
        group,
        stoveW,
        0.01,
        stoveD,
        { x: stoveX, y: pos.y + counterH + 0.04, z: pos.z },
        reg.fascia,
        reg,
    );

    const upperH = 0.65;
    const upperY = pos.y + 1.55;
    addBox(
        group,
        w,
        upperH,
        d * 0.6,
        { x: pos.x, y: upperY, z: pos.z - d * 0.2 },
        reg.wallInterior,
        reg,
    );
}

export function buildKitchenIsland(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const h = 0.88;
    addBox(group, w, h, d, pos, reg.wallInterior, reg);
    addBox(
        group,
        w + 0.06,
        0.04,
        d + 0.06,
        { x: pos.x, y: pos.y + h, z: pos.z },
        reg.fixtureCounter,
        reg,
    );
}

export function buildRefrigerator(
    group: THREE.Group,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const w = 0.68;
    const d = 0.68;
    const h = 1.82;
    addBox(group, w, h, d, pos, reg.fixtureCounter, reg);
    addBox(
        group,
        w * 0.94,
        h * 0.58,
        0.02,
        { x: pos.x, y: pos.y + h * 0.4, z: pos.z + d / 2 + 0.01 },
        reg.wallInterior,
        reg,
    );
    addBox(
        group,
        w * 0.94,
        h * 0.36,
        0.02,
        { x: pos.x, y: pos.y + 0.04, z: pos.z + d / 2 + 0.01 },
        reg.wallInterior,
        reg,
    );
}
