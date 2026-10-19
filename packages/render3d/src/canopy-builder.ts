import * as THREE from 'three';
import { type MaterialRegistry } from './types.js';

export function buildEntranceCanopy(
    doorWidthM: number,
    doorHeightM: number,
    frameDepthM: number,
    registry: MaterialRegistry,
): THREE.Group {
    const group = new THREE.Group();
    const canopyW = doorWidthM + 0.45;
    const canopyD = 0.85;
    const canopyH = 0.05;

    const slabGeo = new THREE.BoxGeometry(canopyW, canopyH, canopyD);
    registry.trackGeometry(slabGeo);
    const slab = new THREE.Mesh(slabGeo, registry.fascia);
    slab.position.set(
        0,
        doorHeightM / 2 + canopyH / 2 + 0.03,
        canopyD / 2 + frameDepthM / 2,
    );
    slab.rotation.x = 0.02;
    slab.castShadow = true;
    group.add(slab);

    const soffitGeo = new THREE.BoxGeometry(
        canopyW - 0.04,
        0.01,
        canopyD - 0.04,
    );
    registry.trackGeometry(soffitGeo);
    const soffit = new THREE.Mesh(soffitGeo, registry.wallInterior);
    soffit.position.set(
        0,
        doorHeightM / 2 + 0.025,
        canopyD / 2 + frameDepthM / 2,
    );
    group.add(soffit);

    const rodGeo = new THREE.BoxGeometry(0.02, 0.02, 0.65);
    registry.trackGeometry(rodGeo);
    const rodX = canopyW / 2 - 0.08;

    const leftRod = new THREE.Mesh(rodGeo, registry.fascia);
    leftRod.position.set(
        -rodX,
        doorHeightM / 2 + 0.24,
        canopyD * 0.45 + frameDepthM / 2,
    );
    leftRod.rotation.x = -0.7;

    const rightRod = new THREE.Mesh(rodGeo, registry.fascia);
    rightRod.position.set(
        rodX,
        doorHeightM / 2 + 0.24,
        canopyD * 0.45 + frameDepthM / 2,
    );
    rightRod.rotation.x = -0.7;

    group.add(leftRod, rightRod);

    return group;
}
