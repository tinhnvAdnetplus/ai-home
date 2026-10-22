import * as THREE from 'three';
import { type MaterialRegistry } from './types.js';
import { WALL_TEXTURE_V_REPEAT_M } from './wall-segment.js';

/**
 * Vertical infill (gable/frieze/shed side wall) in the exterior wall finish. UVs are world-space
 * (u along the face, v = height) at the same scale `wall-segment.ts` uses, so the finish
 * texture continues from the wall below instead of stretching.
 */
export function buildInfillMesh(
    positions: readonly number[],
    index: readonly number[],
    reg: MaterialRegistry,
): THREE.Mesh {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3),
    );
    geo.setIndex([...index]);
    geo.computeVertexNormals();
    const normals = geo.getAttribute('normal');
    const uvs: number[] = [];
    for (let i = 0; i < positions.length / 3; i += 1) {
        const x = positions[i * 3] ?? 0;
        const y = positions[i * 3 + 1] ?? 0;
        const z = positions[i * 3 + 2] ?? 0;
        const isFacingX = Math.abs(normals.getX(i)) > Math.abs(normals.getZ(i));
        uvs.push(isFacingX ? z : x, y / WALL_TEXTURE_V_REPEAT_M);
    }
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    reg.trackGeometry(geo);
    const mesh = new THREE.Mesh(geo, reg.wallExterior);
    mesh.name = 'roof-infill';
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}
