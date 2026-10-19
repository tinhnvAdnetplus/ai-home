import * as THREE from 'three';
import { type RoofBounds } from './roof-types.js';
import { type MaterialRegistry } from './types.js';

export type { RoofBounds };
export { buildHippedRoofMesh } from './roof-hipped.js';

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

    // Gable walls flush with exterior walls (inset by overhang)
    const ov = b.overhang ?? 0;
    const wx1 = b.x1 + ov;
    const wx2 = b.x2 - ov;
    const wz1 = b.z1 + ov;
    const wz2 = b.z2 - ov;
    const yEave = b.yBase + ov * slope;
    const gableGeo = new THREE.BufferGeometry();
    const gablePos = [
        wx1, b.yBase, wz2, wx1, yEave, wz2, wx1, yRidge, cz, wx1, yEave, wz1, wx1, b.yBase, wz1,
        wx2, b.yBase, wz1, wx2, yEave, wz1, wx2, yRidge, cz, wx2, yEave, wz2, wx2, b.yBase, wz2,
    ];
    gableGeo.setAttribute('position', new THREE.Float32BufferAttribute(gablePos, 3));
    gableGeo.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 5, 6, 7, 5, 7, 8, 5, 8, 9]);
    gableGeo.computeVertexNormals();
    reg.trackGeometry(gableGeo);
    group.add(new THREE.Mesh(gableGeo, reg.wallExteriorAlt));

    return group;
}

export function buildFlatRoofMesh(
    b: RoofBounds,
    reg: MaterialRegistry,
): THREE.Group {
    const group = new THREE.Group();
    const w = b.x2 - b.x1;
    const d = b.z2 - b.z1;
    const slabGeo = new THREE.BoxGeometry(w, 0.22, d);
    reg.trackGeometry(slabGeo);
    const slab = new THREE.Mesh(slabGeo, reg.roof);
    slab.position.set((b.x1 + b.x2) / 2, b.yBase + 0.11, (b.z1 + b.z2) / 2);
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);

    const parapetGeo = new THREE.BoxGeometry(w + 0.08, 0.25, d + 0.08);
    reg.trackGeometry(parapetGeo);
    const parapet = new THREE.Mesh(parapetGeo, reg.fascia);
    parapet.position.set((b.x1 + b.x2) / 2, b.yBase + 0.12, (b.z1 + b.z2) / 2);
    group.add(parapet);

    return group;
}
