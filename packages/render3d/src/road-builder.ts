import * as THREE from 'three';
import { type MaterialRegistry } from './types.js';

export function buildRoad(
    midX: number,
    spanX: number,
    frontZ: number,
    roadW: number,
    reg: MaterialRegistry,
): {
    readonly group: THREE.Group;
    readonly dispose: () => void;
} {
    const group = new THREE.Group();
    group.name = 'road-infrastructure';

    const sidewalkW = 1.4;
    const kerbW = 0.16;
    const sidewalkZ = frontZ + sidewalkW / 2;
    const kerbZ = frontZ + sidewalkW + kerbW / 2;
    const roadZ = frontZ + sidewalkW + kerbW + roadW / 2;

    const sidewalkMat = new THREE.MeshStandardMaterial({
        color: '#d6d8d4',
        roughness: 0.8,
        metalness: 0.02,
    });
    const sidewalkGeo = new THREE.BoxGeometry(spanX, 0.03, sidewalkW);
    reg.trackGeometry(sidewalkGeo);
    const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalk.position.set(midX, 0.015, sidewalkZ);
    sidewalk.receiveShadow = true;
    group.add(sidewalk);

    const kerbGeo = new THREE.BoxGeometry(spanX, 0.1, kerbW);
    reg.trackGeometry(kerbGeo);
    const kerb = new THREE.Mesh(kerbGeo, reg.curb);
    kerb.position.set(midX, 0.045, kerbZ);
    kerb.castShadow = true;
    kerb.receiveShadow = true;
    group.add(kerb);

    const asphaltMat = new THREE.MeshStandardMaterial({
        color: '#6e7378',
        roughness: 0.86,
        metalness: 0.04,
    });
    const roadGeo = new THREE.BoxGeometry(spanX, 0.03, roadW);
    reg.trackGeometry(roadGeo);
    const roadMesh = new THREE.Mesh(roadGeo, asphaltMat);
    roadMesh.position.set(midX, -0.012, roadZ);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // Bright dashed white centre line
    const dashLen = 2.4;
    const gapLen = 2.4;
    const cycle = dashLen + gapLen;
    const startX = midX - spanX / 2 + 1.0;
    const endX = midX + spanX / 2 - 1.0;
    const dashGeo = new THREE.BoxGeometry(dashLen, 0.034, 0.16);
    reg.trackGeometry(dashGeo);

    for (let x = startX; x <= endX; x += cycle) {
        const dash = new THREE.Mesh(dashGeo, reg.roadLine);
        dash.position.set(x + dashLen / 2, 0.005, roadZ);
        group.add(dash);
    }

    return {
        group,
        dispose: () => {
            sidewalkMat.dispose();
            asphaltMat.dispose();
            group.clear();
        },
    };
}
