import * as THREE from 'three';
import { type RoofBounds } from './roof-types.js';
import { type MaterialRegistry } from './types.js';

export function buildShedRoofMesh(
    b: RoofBounds,
    slope: number,
    reg: MaterialRegistry,
): THREE.Group {
    const group = new THREE.Group();
    const width = b.x2 - b.x1;
    const depth = b.z2 - b.z1;
    const cx = (b.x1 + b.x2) / 2;
    const cz = (b.z1 + b.z2) / 2;
    const effectiveSlope = Math.min(0.35, Math.max(0.15, slope * 0.65));
    const rise = depth * effectiveSlope;
    const yHigh = b.yBase + rise;
    const fasciaH = 0.18;
    const slopeLen = Math.hypot(depth, rise);
    const pitchAngle = Math.atan2(rise, depth);

    const slabGeo = new THREE.BoxGeometry(width, fasciaH, slopeLen);
    reg.trackGeometry(slabGeo);
    const slabMesh = new THREE.Mesh(slabGeo, reg.roof);
    slabMesh.position.set(cx, (b.yBase + yHigh) / 2, cz);
    slabMesh.rotation.x = pitchAngle;
    slabMesh.castShadow = true;
    slabMesh.receiveShadow = true;
    group.add(slabMesh);

    const fGeo = new THREE.BoxGeometry(width + 0.05, fasciaH * 1.05, 0.06);
    reg.trackGeometry(fGeo);
    const fLow = new THREE.Mesh(fGeo, reg.fascia);
    fLow.position.set(cx, b.yBase, b.z2);
    const fHigh = new THREE.Mesh(fGeo, reg.fascia);
    fHigh.position.set(cx, yHigh, b.z1);
    group.add(fLow, fHigh);

    const ov = b.overhang ?? 0;
    const wx1 = b.x1 + ov;
    const wx2 = b.x2 - ov;
    const wz1 = b.z1 + ov;
    const wz2 = b.z2 - ov;
    const yLowW = b.yBase + ov * effectiveSlope;
    const yHighW = yHigh - ov * effectiveSlope;

    const sideWallGeo = new THREE.BufferGeometry();
    const pos = [
        wx1, b.yBase, wz2, wx1, yLowW, wz2, wx1, yHighW, wz1, wx1, b.yBase, wz1,
        wx2, b.yBase, wz1, wx2, yHighW, wz1, wx2, yLowW, wz2, wx2, b.yBase, wz2,
        wx1, b.yBase, wz1, wx1, yHighW, wz1, wx2, yHighW, wz1, wx2, b.yBase, wz1,
        wx2, b.yBase, wz2, wx2, yLowW, wz2, wx1, yLowW, wz2, wx1, b.yBase, wz2,
    ];
    sideWallGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    sideWallGeo.setIndex([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
    ]);
    sideWallGeo.computeVertexNormals();
    reg.trackGeometry(sideWallGeo);
    group.add(new THREE.Mesh(sideWallGeo, reg.wallExteriorAlt));

    return group;
}
