import * as THREE from 'three';
import { type RoofBounds } from './roof-types.js';
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

    // Fascia perimeter trim band
    const fGeo = new THREE.BoxGeometry(width + 0.1, 0.16, depth + 0.1);
    reg.trackGeometry(fGeo);
    const fascia = new THREE.Mesh(fGeo, reg.fascia);
    fascia.position.set((b.x1 + b.x2) / 2, b.yBase - 0.08, cz);
    group.add(fascia);

    return group;
}
