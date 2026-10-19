import * as THREE from 'three';
import { type Wall } from '@aihome/bdm';
import { toThreeX, toThreeZ } from './coords.js';
import { type MaterialRegistry } from './types.js';

function adjustWallSidingUVs(
    geo: THREE.BoxGeometry,
    lenM: number,
    heightM: number,
): void {
    const uvAttr = geo.getAttribute('uv');
    const uRepeat = Math.max(0.1, lenM);
    const vRepeat = Math.max(0.1, heightM / 0.25);
    for (let i = 16; i < 24; i += 1) {
        const u = uvAttr.getX(i);
        const v = uvAttr.getY(i);
        uvAttr.setXY(i, u * uRepeat, v * vRepeat);
    }
    for (let i = 0; i < 8; i += 1) {
        const v = uvAttr.getY(i);
        uvAttr.setY(i, v * vRepeat);
    }
    uvAttr.needsUpdate = true;
}

export function createSegmentMesh(
    startMm: number,
    endMm: number,
    bottomM: number,
    heightM: number,
    thicknessM: number,
    wall: Wall,
    rotY: number,
    wallLengthMm: number,
    mat: THREE.Material,
    registry: MaterialRegistry,
): THREE.Mesh | null {
    const lenM = (endMm - startMm) * 0.001;
    if (lenM <= 0.005 || heightM <= 0.005) return null;

    const midMm = (startMm + endMm) / 2;
    const ratio = midMm / wallLengthMm;
    const dx = wall.b.x - wall.a.x;
    const dy = wall.b.y - wall.a.y;
    const cxMm = wall.a.x + dx * ratio;
    const cyMm = wall.a.y + dy * ratio;

    const geo = new THREE.BoxGeometry(lenM, heightM, thicknessM);
    const isSiding =
        mat === registry.wallExterior || mat === registry.wallExteriorAlt;
    if (isSiding) {
        adjustWallSidingUVs(geo, lenM, heightM);
    }

    registry.trackGeometry(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(toThreeX(cxMm), bottomM + heightM / 2, toThreeZ(cyMm));
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

export function addWallPlinth(
    wall: Wall,
    rotY: number,
    lenMm: number,
    thickM: number,
    group: THREE.Group,
    reg: MaterialRegistry,
): void {
    // Visible ground-level foundation band (light grey 0.3 m)
    const plinth = createSegmentMesh(
        0,
        lenMm,
        0,
        0.3,
        thickM + 0.04,
        wall,
        rotY,
        lenMm,
        reg.foundation,
        reg,
    );
    if (plinth) group.add(plinth);

    // Thin dark base
    const base = createSegmentMesh(
        0,
        lenMm,
        -0.01,
        0.04,
        thickM + 0.05,
        wall,
        rotY,
        lenMm,
        reg.skirtAO,
        reg,
    );
    if (base) group.add(base);
}
