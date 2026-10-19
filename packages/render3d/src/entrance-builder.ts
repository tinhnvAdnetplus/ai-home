import * as THREE from 'three';
import { type MaterialRegistry } from './types.js';

export function buildEntranceElements(
    entX: number,
    entZ: number,
    zRoadFront: number,
    postX: number | null,
    reg: MaterialRegistry,
): {
    readonly group: THREE.Group;
    readonly dispose: () => void;
} {
    const group = new THREE.Group();
    group.name = 'entrance-elements';

    const brickMat = new THREE.MeshStandardMaterial({
        color: '#9a5d45',
        roughness: 0.88,
        metalness: 0.02,
    });
    const capMat = new THREE.MeshStandardMaterial({
        color: '#d4d7d6',
        roughness: 0.65,
        metalness: 0.05,
    });
    const panelMat = new THREE.MeshStandardMaterial({
        color: '#2e3034',
        roughness: 0.35,
        metalness: 0.4,
    });
    const stoneMat = new THREE.MeshStandardMaterial({
        color: '#e2ded6',
        roughness: 0.78,
        metalness: 0.02,
    });

    // Stepping-stone pavers from entrance door to street
    const paverW = 1.1;
    const paverD = 0.55;
    const paverStep = 0.75;
    const pathSpan = Math.max(0.6, zRoadFront - entZ);
    const paverGeo = new THREE.BoxGeometry(paverW, 0.03, paverD);
    reg.trackGeometry(paverGeo);

    const count = Math.max(1, Math.floor(pathSpan / paverStep));
    for (let i = 0; i <= count; i += 1) {
        const pz = entZ + (pathSpan * i) / Math.max(1, count);
        const paver = new THREE.Mesh(paverGeo, stoneMat);
        paver.position.set(entX, 0.015, pz);
        paver.receiveShadow = true;
        group.add(paver);
    }

    // Brick gate post by the entrance (left out when a narrow lot has no room beside the parking)
    if (postX !== null)
        addGatePost(
            group,
            postX,
            zRoadFront - 0.45,
            { brickMat, capMat, panelMat },
            reg,
        );

    return {
        group,
        dispose: () => {
            brickMat.dispose();
            capMat.dispose();
            panelMat.dispose();
            stoneMat.dispose();
            group.clear();
        },
    };
}

function addGatePost(
    group: THREE.Group,
    postX: number,
    postZ: number,
    mats: {
        readonly brickMat: THREE.Material;
        readonly capMat: THREE.Material;
        readonly panelMat: THREE.Material;
    },
    reg: MaterialRegistry,
): void {
    const { brickMat, capMat, panelMat } = mats;
    const postH = 1.35;

    const postGeo = new THREE.BoxGeometry(0.42, postH, 0.42);
    reg.trackGeometry(postGeo);
    const postMesh = new THREE.Mesh(postGeo, brickMat);
    postMesh.position.set(postX, postH / 2, postZ);
    postMesh.castShadow = true;
    postMesh.receiveShadow = true;
    group.add(postMesh);

    const capGeo = new THREE.BoxGeometry(0.48, 0.08, 0.48);
    reg.trackGeometry(capGeo);
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.set(postX, postH + 0.04, postZ);
    capMesh.castShadow = true;
    capMesh.receiveShadow = true;
    group.add(capMesh);

    const panelGeo = new THREE.BoxGeometry(0.18, 0.24, 0.02);
    reg.trackGeometry(panelGeo);
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(postX, postH * 0.72, postZ + 0.22);
    group.add(panel);
}
