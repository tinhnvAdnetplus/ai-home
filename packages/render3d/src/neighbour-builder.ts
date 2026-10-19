import * as THREE from 'three';
import { createHippedRoofGeo } from './neighbour-roof.js';
import { type MaterialRegistry } from './types.js';

function addHouseBlock(
    group: THREE.Group,
    cx: number,
    cz: number,
    w: number,
    d: number,
    wallH: number,
    roofH: number,
    wallMat: THREE.Material,
    roofMat: THREE.Material,
    reg: MaterialRegistry,
): void {
    const bodyGeo = new THREE.BoxGeometry(w, wallH, d);
    reg.trackGeometry(bodyGeo);
    const body = new THREE.Mesh(bodyGeo, wallMat);
    body.position.set(cx, wallH / 2, cz);
    body.castShadow = true;
    body.receiveShadow = true;

    const roofGeo = createHippedRoofGeo(w, roofH, d);
    reg.trackGeometry(roofGeo);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(cx, wallH, cz);
    roof.castShadow = true;
    roof.receiveShadow = true;

    group.add(body, roof);
}

export function buildNeighbours(
    x1: number,
    x2: number,
    zBack: number,
    _zRoadFront: number,
    reg: MaterialRegistry,
): {
    readonly group: THREE.Group;
    readonly dispose: () => void;
} {
    const group = new THREE.Group();
    group.name = 'neighbouring-houses';

    const wallMat1 = new THREE.MeshStandardMaterial({
        color: '#e8e4dc',
        roughness: 0.88,
        metalness: 0.02,
    });
    const roofMat1 = new THREE.MeshStandardMaterial({
        color: '#2b2e34',
        roughness: 0.45,
        metalness: 0.08,
    });

    // Realistic scale: ~8 x 7 x 6m, placed 2.5m beyond side boundaries at back/sides
    addHouseBlock(
        group,
        x1 - 6.5,
        zBack + 1.2,
        8.0,
        7.0,
        4.2,
        1.8,
        wallMat1,
        roofMat1,
        reg,
    );
    addHouseBlock(
        group,
        x2 + 6.5,
        zBack + 1.8,
        8.0,
        7.0,
        4.2,
        1.8,
        wallMat1,
        roofMat1,
        reg,
    );

    return {
        group,
        dispose: () => {
            wallMat1.dispose();
            roofMat1.dispose();
            group.clear();
        },
    };
}
