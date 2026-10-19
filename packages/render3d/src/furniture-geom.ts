import * as THREE from 'three';
import { type MaterialRegistry, type Point3D } from './types.js';

export function addBox(
    group: THREE.Group,
    w: number,
    h: number,
    d: number,
    pos: Point3D,
    mat: THREE.Material,
    reg: MaterialRegistry,
    rotY = 0,
): THREE.Mesh {
    const geo = new THREE.BoxGeometry(w, h, d);
    reg.trackGeometry(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x, pos.y + h / 2, pos.z);
    if (rotY !== 0) {
        mesh.rotation.y = rotY;
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
}

export function addCylinder(
    group: THREE.Group,
    rTop: number,
    rBot: number,
    h: number,
    segs: number,
    pos: Point3D,
    mat: THREE.Material,
    reg: MaterialRegistry,
): THREE.Mesh {
    const geo = new THREE.CylinderGeometry(rTop, rBot, h, segs);
    reg.trackGeometry(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x, pos.y + h / 2, pos.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
}

export function addLeggedTable(
    group: THREE.Group,
    w: number,
    h: number,
    d: number,
    pos: Point3D,
    topMat: THREE.Material,
    legMat: THREE.Material,
    reg: MaterialRegistry,
): void {
    const topH = 0.04;
    addBox(
        group,
        w,
        topH,
        d,
        { x: pos.x, y: pos.y + h - topH, z: pos.z },
        topMat,
        reg,
    );
    const legW = 0.05;
    const legH = h - topH;
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
            legH,
            legW,
            { x: pos.x + cx, y: pos.y, z: pos.z + cz },
            legMat,
            reg,
        );
    }
}

export function addPottedPlant(
    group: THREE.Group,
    pos: Point3D,
    reg: MaterialRegistry,
    scale = 1.0,
): void {
    const potH = 0.32 * scale;
    addCylinder(
        group,
        0.16 * scale,
        0.12 * scale,
        potH,
        12,
        pos,
        reg.curb,
        reg,
    );
    const trunkH = 0.25 * scale;
    addCylinder(
        group,
        0.02 * scale,
        0.025 * scale,
        trunkH,
        6,
        { x: pos.x, y: pos.y + potH, z: pos.z },
        reg.treeTrunk,
        reg,
    );
    const folH = 0.42 * scale;
    addCylinder(
        group,
        0.24 * scale,
        0.08 * scale,
        folH,
        8,
        { x: pos.x, y: pos.y + potH + trunkH * 0.5, z: pos.z },
        reg.treeFoliage,
        reg,
    );
    addCylinder(
        group,
        0.18 * scale,
        0.22 * scale,
        folH * 0.7,
        8,
        { x: pos.x, y: pos.y + potH + trunkH * 0.9, z: pos.z },
        reg.treeFoliageDark,
        reg,
    );
}
