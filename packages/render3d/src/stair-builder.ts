import * as THREE from 'three';
import { type Floor, type Polygon, type Stair } from '@aihome/bdm';
import { toThreeX, toThreeY, toThreeZ } from './coords.js';
import { buildUturnStair } from './stair-uturn.js';
import { type MaterialRegistry } from './types.js';

function computePolygonBounds(poly: Polygon): {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
} {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const pt of poly) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
    }
    return { minX, maxX, minY, maxY };
}

function buildSingleStair(
    stair: Stair,
    floor: Floor,
    registry: MaterialRegistry,
): THREE.Group {
    const group = new THREE.Group();
    const bounds = computePolygonBounds(stair.polygon);
    const widthMm = bounds.maxX - bounds.minX;
    const depthMm = bounds.maxY - bounds.minY;
    if (widthMm <= 10 || depthMm <= 10) return group;

    const stepsCount = stair.steps > 0 ? stair.steps : 14;
    const floorHMm = floor.heightMm > 0 ? floor.heightMm : 2800;
    const stepHM = (floorHMm / stepsCount) * 0.001;
    const baseElevM = toThreeY(floor.elevationMm);
    const isAlongY = depthMm >= widthMm;

    for (let i = 0; i < stepsCount; i += 1) {
        const stepWidthM = isAlongY
            ? widthMm * 0.001
            : (widthMm / stepsCount) * 0.001;
        const stepDepthM = isAlongY
            ? (depthMm / stepsCount) * 0.001
            : depthMm * 0.001;

        // Riser (vertical face)
        const riserGeo = new THREE.BoxGeometry(
            stepWidthM * 0.96,
            stepHM,
            stepDepthM * 0.92,
        );
        registry.trackGeometry(riserGeo);
        const riserMesh = new THREE.Mesh(riserGeo, registry.wallInterior);

        // Tread (wood top plank)
        const treadH = 0.03;
        const treadGeo = new THREE.BoxGeometry(
            stepWidthM * 0.98,
            treadH,
            stepDepthM * 1.04,
        );
        registry.trackGeometry(treadGeo);
        const treadMesh = new THREE.Mesh(treadGeo, registry.woodAccent);

        const midXMm = isAlongY
            ? (bounds.minX + bounds.maxX) / 2
            : bounds.minX + (i + 0.5) * (widthMm / stepsCount);
        const midYMm = isAlongY
            ? bounds.minY + (i + 0.5) * (depthMm / stepsCount)
            : (bounds.minY + bounds.maxY) / 2;

        const posX = toThreeX(midXMm);
        const posY = baseElevM + (i + 0.5) * stepHM;
        const posZ = toThreeZ(midYMm);

        riserMesh.position.set(posX, posY, posZ);
        riserMesh.castShadow = true;
        riserMesh.receiveShadow = true;
        group.add(riserMesh);

        treadMesh.position.set(posX, posY + stepHM / 2 - treadH / 2, posZ);
        treadMesh.castShadow = true;
        treadMesh.receiveShadow = true;
        group.add(treadMesh);

        // Handrail post & rail on every 3rd step
        if (i % 3 === 0 || i === stepsCount - 1) {
            const postH = 0.85;
            const postGeo = new THREE.CylinderGeometry(0.015, 0.015, postH, 6);
            registry.trackGeometry(postGeo);
            const postMesh = new THREE.Mesh(postGeo, registry.frame);
            const railOffX = isAlongY ? stepWidthM / 2 - 0.05 : 0;
            const railOffZ = isAlongY ? 0 : stepDepthM / 2 - 0.05;
            postMesh.position.set(
                posX + railOffX,
                posY + stepHM / 2 + postH / 2,
                posZ + railOffZ,
            );
            group.add(postMesh);
        }
    }

    return group;
}

export function buildFloorStairs(
    floor: Floor,
    registry: MaterialRegistry,
): THREE.Group {
    const group = new THREE.Group();
    for (const stair of floor.stairs) {
        group.add(
            stair.direction.startsWith('uturn')
                ? buildUturnStair(stair, floor, registry)
                : buildSingleStair(stair, floor, registry),
        );
    }
    return group;
}
