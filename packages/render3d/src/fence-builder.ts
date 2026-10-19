import * as THREE from 'three';
import { type MaterialRegistry } from './types.js';

export function buildFenceLine(
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    reg: MaterialRegistry,
    fenceMat?: THREE.Material,
): THREE.Group {
    const group = new THREE.Group();
    const len = Math.hypot(x2 - x1, z2 - z1);
    if (len < 0.5) return group;

    const angle = Math.atan2(x2 - x1, z2 - z1);
    const postCount = Math.max(2, Math.floor(len / 1.6));
    const mat =
        fenceMat ??
        new THREE.MeshStandardMaterial({
            color: '#8b5a36',
            roughness: 0.75,
            metalness: 0.05,
        });

    for (let i = 0; i <= postCount; i += 1) {
        const ratio = i / postCount;
        const px = x1 + (x2 - x1) * ratio;
        const pz = z1 + (z2 - z1) * ratio;
        const postGeo = new THREE.BoxGeometry(0.07, 0.95, 0.07);
        reg.trackGeometry(postGeo);
        const post = new THREE.Mesh(postGeo, mat);
        post.position.set(px, 0.475, pz);
        post.castShadow = true;
        group.add(post);
    }

    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;
    const slatGeo = new THREE.BoxGeometry(0.03, 0.09, len);
    reg.trackGeometry(slatGeo);

    for (const h of [0.32, 0.58, 0.84]) {
        const slat = new THREE.Mesh(slatGeo, mat);
        slat.position.set(midX, h, midZ);
        slat.rotation.y = angle;
        slat.castShadow = true;
        group.add(slat);
    }

    return group;
}
