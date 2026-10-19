import * as THREE from 'three';
import { type SceneBounds } from './types.js';

export function computeSceneBounds(object: THREE.Object3D): SceneBounds {
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) {
        const zero = { x: 0, y: 0, z: 0 };
        return { min: zero, max: zero, center: zero, size: zero };
    }

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    return {
        min: { x: box.min.x, y: box.min.y, z: box.min.z },
        max: { x: box.max.x, y: box.max.y, z: box.max.z },
        center: { x: center.x, y: center.y, z: center.z },
        size: { x: size.x, y: size.y, z: size.z },
    };
}
