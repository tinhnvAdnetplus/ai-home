import * as THREE from 'three';
import { type Polygon } from '@aihome/bdm';
import { toThreeX, toThreeZ } from './coords.js';
import { type MaterialRegistry } from './types.js';

export function buildWoodDeck(
    deckPolygon: Polygon | undefined,
    reg: MaterialRegistry,
): THREE.Group | null {
    if (!deckPolygon || deckPolygon.length < 3) return null;
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const p of deckPolygon) {
        const x = toThreeX(p.x);
        const z = toThreeZ(p.y);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
    }
    const w = maxX - minX;
    const d = maxZ - minZ;
    if (w < 0.4 || d < 0.4) return null;

    const group = new THREE.Group();
    group.name = 'wood-deck';
    const deckH = 0.28;
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;

    const baseGeo = new THREE.BoxGeometry(w - 0.06, deckH - 0.05, d - 0.06);
    reg.trackGeometry(baseGeo);
    const baseMesh = new THREE.Mesh(baseGeo, reg.skirtAO);
    baseMesh.position.set(cx, (deckH - 0.05) / 2, cz);
    group.add(baseMesh);

    const plankCount = Math.max(4, Math.round(d / 0.16));
    const plankD = d / plankCount - 0.012;
    const plankGeo = new THREE.BoxGeometry(w, 0.04, Math.max(0.06, plankD));
    reg.trackGeometry(plankGeo);
    for (let i = 0; i < plankCount; i += 1) {
        const pz = minZ + (i + 0.5) * (d / plankCount);
        const plank = new THREE.Mesh(plankGeo, reg.woodAccent);
        plank.position.set(cx, deckH - 0.02, pz);
        plank.castShadow = true;
        plank.receiveShadow = true;
        group.add(plank);
    }

    return group;
}
