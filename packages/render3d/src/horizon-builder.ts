import * as THREE from 'three';
import { type MaterialRegistry } from './types.js';

function createRidgeGeometry(
    radius: number,
    baseH: number,
    varH: number,
    segments: number,
    phase: number,
): THREE.BufferGeometry {
    const positions: number[] = [];
    const ridge = (i: number): number => {
        const k = i % segments;
        return (
            baseH +
            Math.abs(Math.sin(k * 0.9 + phase)) * varH +
            Math.abs(Math.cos(k * 0.37 + phase * 2)) * varH * 0.6
        );
    };
    for (let i = 0; i < segments; i += 1) {
        const a0 = (i / segments) * Math.PI * 2;
        const a1 = ((i + 1) / segments) * Math.PI * 2;
        const x0 = Math.cos(a0) * radius;
        const z0 = Math.sin(a0) * radius;
        const x1 = Math.cos(a1) * radius;
        const z1 = Math.sin(a1) * radius;
        const h0 = ridge(i);
        const h1 = ridge(i + 1);
        positions.push(x0, -1, z0, x1, -1, z1, x1, h1, z1);
        positions.push(x0, -1, z0, x1, h1, z1, x0, h0, z0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3),
    );
    geo.computeVertexNormals();
    return geo;
}

function addRing(
    group: THREE.Group,
    reg: MaterialRegistry,
    mat: THREE.Material,
    geo: THREE.BufferGeometry,
    midX: number,
    midZ: number,
): void {
    reg.trackGeometry(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(midX, 0, midZ);
    mesh.frustumCulled = false;
    group.add(mesh);
}

export function buildHorizon(
    midX: number,
    midZ: number,
    reg: MaterialRegistry,
): {
    readonly group: THREE.Group;
    readonly dispose: () => void;
} {
    const group = new THREE.Group();
    group.name = 'horizon-mountains';

    // MeshBasicMaterial: flat atmospheric silhouettes that never darken or wash out
    const farMat = new THREE.MeshBasicMaterial({
        color: '#a9c1d6',
        side: THREE.DoubleSide,
        fog: false,
    });
    const midMat = new THREE.MeshBasicMaterial({
        color: '#b9d0c4',
        side: THREE.DoubleSide,
        fog: false,
    });
    addRing(
        group,
        reg,
        farMat,
        createRidgeGeometry(300, 4, 14, 36, 0.6),
        midX,
        midZ,
    );
    addRing(
        group,
        reg,
        midMat,
        createRidgeGeometry(230, 1, 6, 30, 2.1),
        midX,
        midZ,
    );

    return {
        group,
        dispose: () => {
            farMat.dispose();
            midMat.dispose();
            group.clear();
        },
    };
}
