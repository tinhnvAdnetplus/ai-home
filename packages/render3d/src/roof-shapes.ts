import * as THREE from 'three';
import { type RoofBounds, roofWallFaces } from './roof-types.js';
import { type MaterialRegistry } from './types.js';
import { buildInfillMesh } from './roof-infill.js';

export type { RoofBounds };
export { buildHippedRoofMesh } from './roof-hipped.js';
export { buildInfillMesh };

function adjustRoofUVs(
    geo: THREE.BoxGeometry,
    widthM: number,
    slopeM: number,
): void {
    const uvAttr = geo.getAttribute('uv');
    const uRepeat = Math.max(1, Math.round(widthM / 0.45));
    const vRepeat = Math.max(1, Math.round(slopeM / 1.0));
    // Top face (+Y, vertices 8..11) and bottom face (-Y, 12..15)
    for (let i = 8; i < 16; i += 1) {
        const u = uvAttr.getX(i);
        const v = uvAttr.getY(i);
        uvAttr.setXY(i, u * uRepeat, v * vRepeat);
    }
    uvAttr.needsUpdate = true;
}

export function buildGableRoofMesh(
    b: RoofBounds,
    slope: number,
    reg: MaterialRegistry,
): THREE.Group {
    const group = new THREE.Group();
    const cz = (b.z1 + b.z2) / 2;
    const depth = b.z2 - b.z1;
    const yRidge = b.yBase + (depth / 2) * slope;
    const fasciaH = 0.18;
    const slopeLen = Math.hypot(depth / 2, yRidge - b.yBase);
    const pitchAngle = Math.atan2(yRidge - b.yBase, depth / 2);
    const width = b.x2 - b.x1;

    const slabGeo = new THREE.BoxGeometry(width, fasciaH, slopeLen);
    adjustRoofUVs(slabGeo, width, slopeLen);
    reg.trackGeometry(slabGeo);

    const southMesh = new THREE.Mesh(slabGeo, reg.roof);
    southMesh.position.set(
        (b.x1 + b.x2) / 2,
        (b.yBase + yRidge) / 2,
        cz + depth / 4,
    );
    southMesh.rotation.x = pitchAngle;
    southMesh.castShadow = true;
    southMesh.receiveShadow = true;

    const northMesh = new THREE.Mesh(slabGeo, reg.roof);
    northMesh.position.set(
        (b.x1 + b.x2) / 2,
        (b.yBase + yRidge) / 2,
        cz - depth / 4,
    );
    northMesh.rotation.x = -pitchAngle;
    northMesh.castShadow = true;
    northMesh.receiveShadow = true;
    group.add(southMesh, northMesh);

    // Eaves fascia boards (north and south)
    const fGeo = new THREE.BoxGeometry(width + 0.05, fasciaH * 1.05, 0.06);
    reg.trackGeometry(fGeo);
    const fSouth = new THREE.Mesh(fGeo, reg.fascia);
    fSouth.position.set((b.x1 + b.x2) / 2, b.yBase, b.z2);
    const fNorth = new THREE.Mesh(fGeo, reg.fascia);
    fNorth.position.set((b.x1 + b.x2) / 2, b.yBase, b.z1);
    group.add(fSouth, fNorth);

    // Ridge cap along apex
    const ridgeGeo = new THREE.BoxGeometry(width + 0.08, 0.05, 0.22);
    reg.trackGeometry(ridgeGeo);
    const ridgeCap = new THREE.Mesh(ridgeGeo, reg.fascia);
    ridgeCap.position.set((b.x1 + b.x2) / 2, yRidge + 0.02, cz);
    group.add(ridgeCap);

    // Bargeboards (sloping verge rakes on east and west gable edges)
    const bargeGeo = new THREE.BoxGeometry(0.06, fasciaH * 1.05, slopeLen);
    reg.trackGeometry(bargeGeo);
    for (const x of [b.x1, b.x2]) {
        const bSouth = new THREE.Mesh(bargeGeo, reg.fascia);
        bSouth.position.set(x, (b.yBase + yRidge) / 2, cz + depth / 4);
        bSouth.rotation.x = pitchAngle;
        const bNorth = new THREE.Mesh(bargeGeo, reg.fascia);
        bNorth.position.set(x, (b.yBase + yRidge) / 2, cz - depth / 4);
        bNorth.rotation.x = -pitchAngle;
        group.add(bSouth, bNorth);
    }

    // Infill between the wall plate (yBase) and the roof, on the OUTER wall faces so it is flush
    // with the walls below: gable triangles at both ends and a frieze along both eaves (the roof
    // slab only reaches yBase at the eave tip, so without the frieze there is an open slot
    // between wall top and roof at the wall line).
    const f = roofWallFaces(b);
    const yFront = b.yBase + (b.z2 - f.z2) * slope;
    const yBack = b.yBase + (f.z1 - b.z1) * slope;
    const gablePos = [
        f.x1, b.yBase, f.z2, f.x1, yFront, f.z2, f.x1, yRidge, cz, f.x1, yBack, f.z1, f.x1, b.yBase, f.z1,
        f.x2, b.yBase, f.z1, f.x2, yBack, f.z1, f.x2, yRidge, cz, f.x2, yFront, f.z2, f.x2, b.yBase, f.z2,
        f.x1, b.yBase, f.z2, f.x2, b.yBase, f.z2, f.x2, yFront, f.z2, f.x1, yFront, f.z2,
        f.x2, b.yBase, f.z1, f.x1, b.yBase, f.z1, f.x1, yBack, f.z1, f.x2, yBack, f.z1,
    ];
    group.add(
        buildInfillMesh(
            gablePos,
            [0, 1, 2, 0, 2, 3, 0, 3, 4, 5, 6, 7, 5, 7, 8, 5, 8, 9, 10, 11, 12, 10, 12, 13, 14, 15, 16, 14, 16, 17],
            reg,
        ),
    );

    return group;
}

export function buildFlatRoofMesh(
    b: RoofBounds,
    reg: MaterialRegistry,
    hasParapet = true,
): THREE.Group {
    const group = new THREE.Group();
    const w = b.x2 - b.x1;
    const d = b.z2 - b.z1;
    const slabGeo = new THREE.BoxGeometry(w, 0.22, d);
    reg.trackGeometry(slabGeo);
    const slab = new THREE.Mesh(slabGeo, reg.roof);
    slab.name = 'roof-slab';
    slab.position.set((b.x1 + b.x2) / 2, b.yBase + 0.11, (b.z1 + b.z2) / 2);
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);
    if (!hasParapet) return group;

    // Parapet as a perimeter ring (a solid box would swallow the slab and hide the roof finish).
    const t = 0.12;
    const h = 0.35;
    const ox1 = b.x1 - 0.04;
    const ox2 = b.x2 + 0.04;
    const oz1 = b.z1 - 0.04;
    const oz2 = b.z2 + 0.04;
    const ring: [number, number, number, number][] = [
        [ox1, ox2, oz2 - t, oz2],
        [ox1, ox2, oz1, oz1 + t],
        [ox1, ox1 + t, oz1 + t, oz2 - t],
        [ox2 - t, ox2, oz1 + t, oz2 - t],
    ];
    for (const [x1, x2, z1, z2] of ring) {
        const geo = new THREE.BoxGeometry(x2 - x1, h, z2 - z1);
        reg.trackGeometry(geo);
        const part = new THREE.Mesh(geo, reg.fascia);
        part.name = 'roof-parapet';
        part.position.set((x1 + x2) / 2, b.yBase + h / 2, (z1 + z2) / 2);
        part.castShadow = true;
        part.receiveShadow = true;
        group.add(part);
    }

    return group;
}
