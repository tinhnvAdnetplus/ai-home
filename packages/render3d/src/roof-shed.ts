import * as THREE from 'three';
import { buildInfillMesh } from './roof-infill.js';
import { type RoofBounds, roofWallFaces } from './roof-types.js';
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

    // Side walls up to the roof on the outer wall faces (flush with the walls below). The slab
    // centreline drops by `effectiveSlope` per metre from the high (z1) to the low (z2) eave.
    const f = roofWallFaces(b);
    const yAt = (z: number): number => yHigh - (z - b.z1) * effectiveSlope;
    const yLowW = yAt(f.z2);
    const yHighW = yAt(f.z1);
    const pos = [
        f.x1, b.yBase, f.z2, f.x1, yLowW, f.z2, f.x1, yHighW, f.z1, f.x1, b.yBase, f.z1,
        f.x2, b.yBase, f.z1, f.x2, yHighW, f.z1, f.x2, yLowW, f.z2, f.x2, b.yBase, f.z2,
        f.x2, b.yBase, f.z1, f.x1, b.yBase, f.z1, f.x1, yHighW, f.z1, f.x2, yHighW, f.z1,
        f.x1, b.yBase, f.z2, f.x2, b.yBase, f.z2, f.x2, yLowW, f.z2, f.x1, yLowW, f.z2,
    ];
    group.add(
        buildInfillMesh(
            pos,
            [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15],
            reg,
        ),
    );

    return group;
}
