import type * as THREE from 'three';
import { addBox, addLeggedTable } from './furniture-geom.js';
import { type MaterialRegistry, type Point3D } from './types.js';

export function buildSofa(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const seatH = 0.42;
    const seatD = d * 0.72;
    const backH = 0.36;
    const backD = d - seatD;
    const armW = 0.16;

    addBox(
        group,
        w - armW * 2,
        seatH,
        seatD,
        { x: pos.x, y: pos.y, z: pos.z + backD / 2 },
        reg.fixtureFabric,
        reg,
    );
    addBox(
        group,
        w,
        backH,
        backD,
        { x: pos.x, y: pos.y + seatH, z: pos.z - seatD / 2 },
        reg.fixtureFabric,
        reg,
    );
    addBox(
        group,
        armW,
        seatH + 0.18,
        d,
        { x: pos.x - w / 2 + armW / 2, y: pos.y, z: pos.z },
        reg.fixtureFabric,
        reg,
    );
    addBox(
        group,
        armW,
        seatH + 0.18,
        d,
        { x: pos.x + w / 2 - armW / 2, y: pos.y, z: pos.z },
        reg.fixtureFabric,
        reg,
    );
}

export function buildCoffeeTable(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    addLeggedTable(
        group,
        w,
        0.38,
        d,
        pos,
        reg.woodAccent,
        reg.fixtureWood,
        reg,
    );
}

export function buildTvUnit(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    const benchH = 0.42;
    addBox(group, w, benchH, d, pos, reg.woodAccent, reg);

    const tvW = Math.min(w * 0.75, 1.25);
    const tvH = 0.68;
    const tvThick = 0.04;
    addBox(
        group,
        0.32,
        0.02,
        0.22,
        { x: pos.x, y: pos.y + benchH, z: pos.z },
        reg.frame,
        reg,
    );
    addBox(
        group,
        0.06,
        0.1,
        0.05,
        { x: pos.x, y: pos.y + benchH + 0.02, z: pos.z },
        reg.frame,
        reg,
    );
    addBox(
        group,
        tvW,
        tvH,
        tvThick,
        { x: pos.x, y: pos.y + benchH + 0.1, z: pos.z },
        reg.fascia,
        reg,
    );
}

export function buildLivingRug(
    group: THREE.Group,
    w: number,
    d: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    addBox(
        group,
        w,
        0.015,
        d,
        { x: pos.x, y: pos.y + 0.005, z: pos.z },
        reg.paving,
        reg,
    );
}
