import * as THREE from 'three';
import { type MaterialRegistry } from './types.js';

export function addBox(
    group: THREE.Group,
    reg: MaterialRegistry,
    mat: THREE.Material,
    size: readonly [number, number, number],
    at: readonly [number, number, number],
): void {
    const geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
    reg.trackGeometry(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(at[0], at[1], at[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
}

/** A thin board running from point a to point b (stringer / handrail). */
export function addSlopedBoard(
    group: THREE.Group,
    reg: MaterialRegistry,
    mat: THREE.Material,
    a: THREE.Vector3,
    b: THREE.Vector3,
    thickness: readonly [number, number],
): void {
    const dir = new THREE.Vector3().subVectors(b, a);
    const geo = new THREE.BoxGeometry(dir.length(), thickness[0], thickness[1]);
    reg.trackGeometry(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(1, 0, 0),
        dir.normalize(),
    );
    mesh.castShadow = true;
    group.add(mesh);
}
