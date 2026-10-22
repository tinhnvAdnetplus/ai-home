import * as THREE from 'three';
import { type Wall, type WallSpan } from '@aihome/bdm';
import { toThreeX, toThreeZ } from './coords.js';
import { type MaterialRegistry } from './types.js';

/** Height (m) covered by one vertical repeat of an exterior wall finish texture. */
export const WALL_TEXTURE_V_REPEAT_M = 0.25;

function adjustWallSidingUVs(
    geo: THREE.BoxGeometry,
    lenM: number,
    heightM: number,
): void {
    const uvAttr = geo.getAttribute('uv');
    const uRepeat = Math.max(0.1, lenM);
    const vRepeat = Math.max(0.1, heightM / WALL_TEXTURE_V_REPEAT_M);
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

/**
 * Span of a band that is `extraMm` proud of the wall on each side (plinth, skirt, belt line).
 * At a junction it must grow/shrink by the same amount as its own extra thickness, or the bands
 * of two meeting walls leave a notch (extended end) or overlap with coplanar faces (trimmed end).
 */
export function skinSpan(
    span: WallSpan,
    lenMm: number,
    extraMm: number,
): WallSpan {
    const adjust = (delta: number): number =>
        delta > 0.5 ? extraMm : delta < -0.5 ? -extraMm : 0;
    return {
        startMm: span.startMm - adjust(-span.startMm),
        endMm: span.endMm + adjust(span.endMm - lenMm),
    };
}

export function addWallPlinth(
    wall: Wall,
    rotY: number,
    lenMm: number,
    thickM: number,
    group: THREE.Group,
    reg: MaterialRegistry,
    span: WallSpan = { startMm: 0, endMm: lenMm },
): void {
    // Visible ground-level foundation band (light grey 0.3 m)
    const plinthSpan = skinSpan(span, lenMm, 20);
    const plinth = createSegmentMesh(
        plinthSpan.startMm,
        plinthSpan.endMm,
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
    const baseSpan = skinSpan(span, lenMm, 25);
    const base = createSegmentMesh(
        baseSpan.startMm,
        baseSpan.endMm,
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
