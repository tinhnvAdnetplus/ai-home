import * as THREE from 'three';
import { type Wall } from '@aihome/bdm';
import { toThreeX, toThreeZ } from './coords.js';

/**
 * Wall midpoint and its outward-facing normal (used by the dollhouse cutaway to decide which
 * walls face the camera). For exterior walls the normal is flipped to point away from the
 * building centre; interior walls keep an arbitrary but consistent side.
 */
export function computeWallMidAndNormal(
    wall: Wall,
    dx: number,
    dy: number,
    bCenter: THREE.Vector3,
): { readonly center: THREE.Vector2; readonly normal: THREE.Vector2 } {
    const midX = toThreeX((wall.a.x + wall.b.x) / 2);
    const midZ = toThreeZ((wall.a.y + wall.b.y) / 2);

    const sx = dx * 0.001;
    const sz = -dy * 0.001;
    const segHypot = Math.hypot(sx, sz) || 1;
    const n1x = -sz / segHypot;
    const n1z = sx / segHypot;

    let [normalX, normalZ] = [n1x, n1z];
    if (wall.kind === 'exterior') {
        const vx = midX - bCenter.x;
        const vz = midZ - bCenter.z;
        if (n1x * vx + n1z * vz < 0) {
            normalX = -n1x;
            normalZ = -n1z;
        }
    }
    return {
        center: new THREE.Vector2(midX, midZ),
        normal: new THREE.Vector2(normalX, normalZ),
    };
}
