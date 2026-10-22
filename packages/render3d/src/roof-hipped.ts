import * as THREE from 'three';
import { type RoofBounds, roofWallFaces } from './roof-types.js';
import { type MaterialRegistry } from './types.js';

export function buildHippedRoofMesh(
    b: RoofBounds,
    slope: number,
    reg: MaterialRegistry,
): THREE.Group {
    const group = new THREE.Group();
    const width = b.x2 - b.x1;
    const depth = b.z2 - b.z1;
    const cz = (b.z1 + b.z2) / 2;
    const hRidge = Math.min(width, depth) * 0.35 * slope;
    const yRidge = b.yBase + hRidge;
    const ridgeOffset = Math.max(0.5, (width - depth) / 2);
    const rx1 = (b.x1 + b.x2) / 2 - ridgeOffset;
    const rx2 = (b.x1 + b.x2) / 2 + ridgeOffset;

    const geo = new THREE.BufferGeometry();
    const pos = [
        b.x1,
        b.yBase,
        b.z2,
        b.x2,
        b.yBase,
        b.z2,
        rx2,
        yRidge,
        cz,
        rx1,
        yRidge,
        cz,
        b.x2,
        b.yBase,
        b.z1,
        b.x1,
        b.yBase,
        b.z1,
        rx1,
        yRidge,
        cz,
        rx2,
        yRidge,
        cz,
        b.x1,
        b.yBase,
        b.z1,
        b.x1,
        b.yBase,
        b.z2,
        rx1,
        yRidge,
        cz,
        b.x2,
        b.yBase,
        b.z2,
        b.x2,
        b.yBase,
        b.z1,
        rx2,
        yRidge,
        cz,
    ];
    const idx = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 11, 12, 13];
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);

    // Compute UVs for standing seam texture
    const uvs: number[] = [];
    for (let i = 0; i < pos.length; i += 3) {
        const px = pos[i] ?? 0;
        const py = pos[i + 1] ?? 0;
        uvs.push(px / 0.45, py / 1.0);
    }
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    reg.trackGeometry(geo);

    const roofMesh = new THREE.Mesh(geo, reg.roof);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    group.add(roofMesh);

    // Ridge cap along horizontal apex
    const ridgeLen = Math.max(0.2, rx2 - rx1);
    const rCapGeo = new THREE.BoxGeometry(ridgeLen + 0.08, 0.05, 0.22);
    reg.trackGeometry(rCapGeo);
    const ridgeCap = new THREE.Mesh(rCapGeo, reg.fascia);
    ridgeCap.position.set((rx1 + rx2) / 2, yRidge + 0.02, cz);
    group.add(ridgeCap);

    // Fascia + soffit as a perimeter ring from the eave edge to just inside the outer wall
    // faces. (A solid box over the whole footprint used to sit inside the top storey and hide
    // its ceiling in walk mode.)
    const f = roofWallFaces(b);
    const ox1 = b.x1 - 0.05;
    const ox2 = b.x2 + 0.05;
    const oz1 = b.z1 - 0.05;
    const oz2 = b.z2 + 0.05;
    const ix1 = f.x1 + 0.02;
    const ix2 = f.x2 - 0.02;
    const iz1 = f.z1 + 0.02;
    const iz2 = f.z2 - 0.02;
    const ring: [number, number, number, number][] = [
        [ox1, ox2, iz2, oz2],
        [ox1, ox2, oz1, iz1],
        [ox1, ix1, iz1, iz2],
        [ix2, ox2, iz1, iz2],
    ];
    for (const [x1, x2, z1, z2] of ring) {
        if (x2 - x1 < 0.01 || z2 - z1 < 0.01) continue;
        const fGeo = new THREE.BoxGeometry(x2 - x1, 0.16, z2 - z1);
        reg.trackGeometry(fGeo);
        const fascia = new THREE.Mesh(fGeo, reg.fascia);
        fascia.name = 'roof-soffit';
        fascia.position.set((x1 + x2) / 2, b.yBase - 0.08, (z1 + z2) / 2);
        group.add(fascia);
    }

    return group;
}
