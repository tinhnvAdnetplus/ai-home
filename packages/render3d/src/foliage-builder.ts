import * as THREE from 'three';
import { createContactShadowContext } from './contact-shadow.js';
import { buildFenceLine } from './fence-builder.js';
import { type MaterialRegistry } from './types.js';

export { buildFenceLine };

/** Horizontal canopy reach (m) of `addTree` at scale 1 (largest blob offset + radius). */
export const TREE_CANOPY_REACH_M = 1.28;

/** Deterministic 0..1 value per position, so repeated trees vary but never between renders. */
function positionHash(x: number, z: number): number {
    const v = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
    return v - Math.floor(v);
}

export type FoliageContext = {
    readonly addTree: (
        group: THREE.Group,
        x: number,
        z: number,
        scale: number,
    ) => void;
    readonly addShrub: (
        group: THREE.Group,
        x: number,
        z: number,
        radius: number,
        hasBerries?: boolean,
    ) => void;
    readonly dispose: () => void;
};

export function createFoliageContext(reg: MaterialRegistry): FoliageContext {
    const shadowCtx = createContactShadowContext();

    const lightGreenMat = new THREE.MeshStandardMaterial({
        color: '#86ab64',
        flatShading: true,
        roughness: 0.82,
    });
    const midGreenMat = new THREE.MeshStandardMaterial({
        color: '#6f9752',
        flatShading: true,
        roughness: 0.82,
    });
    const darkGreenMat = new THREE.MeshStandardMaterial({
        color: '#5a8243',
        flatShading: true,
        roughness: 0.82,
    });
    const berryMat = new THREE.MeshStandardMaterial({
        color: '#a8322d',
        roughness: 0.35,
        metalness: 0.15,
    });

    function addTree(
        group: THREE.Group,
        x: number,
        z: number,
        scale: number,
    ): void {
        const shadow = shadowCtx.createShadowMesh(
            2.8 * scale,
            2.8 * scale,
            0.48,
        );
        shadow.position.set(x, 0.005, z);
        group.add(shadow);

        const trunkH = 1.5 * scale;
        const trunkGeo = new THREE.CylinderGeometry(
            0.1 * scale,
            0.15 * scale,
            trunkH,
            8,
        );
        reg.trackGeometry(trunkGeo);
        const trunk = new THREE.Mesh(trunkGeo, reg.treeTrunk);
        trunk.position.set(x, trunkH / 2, z);
        trunk.castShadow = true;
        group.add(trunk);

        // Big, rounded lush canopies (detail 2) in lighter fresh greens
        const f1Geo = new THREE.IcosahedronGeometry(1.2 * scale, 2);
        reg.trackGeometry(f1Geo);
        const f1 = new THREE.Mesh(f1Geo, midGreenMat);
        f1.position.set(x, trunkH + 0.85 * scale, z);
        f1.castShadow = true;
        group.add(f1);

        const f2Geo = new THREE.IcosahedronGeometry(0.95 * scale, 2);
        reg.trackGeometry(f2Geo);
        // The secondary blobs are turned by a per-position angle so a row of trees does not
        // repeat the exact same silhouette (reach stays within TREE_CANOPY_REACH_M).
        const turn = positionHash(x, z) * Math.PI * 2;
        const off = (dx: number, dz: number): [number, number] => [
            x + (dx * Math.cos(turn) - dz * Math.sin(turn)) * scale,
            z + (dx * Math.sin(turn) + dz * Math.cos(turn)) * scale,
        ];
        const f2 = new THREE.Mesh(f2Geo, lightGreenMat);
        const [f2x, f2z] = off(0.25, -0.15);
        f2.position.set(f2x, trunkH + 1.45 * scale, f2z);
        f2.castShadow = true;
        group.add(f2);

        const f3Geo = new THREE.IcosahedronGeometry(0.85 * scale, 2);
        reg.trackGeometry(f3Geo);
        const f3 = new THREE.Mesh(f3Geo, darkGreenMat);
        const [f3x, f3z] = off(-0.35, 0.25);
        f3.position.set(f3x, trunkH + 0.95 * scale, f3z);
        f3.castShadow = true;
        group.add(f3);
    }

    function addShrub(
        group: THREE.Group,
        x: number,
        z: number,
        radius: number,
        hasBerries = false,
    ): void {
        const geo = new THREE.SphereGeometry(radius, 8, 6);
        geo.scale(1, 0.65, 1);
        reg.trackGeometry(geo);
        const mesh = new THREE.Mesh(geo, reg.shrub);
        mesh.position.set(x, radius * 0.5, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        if (hasBerries) {
            const berryGeo = new THREE.SphereGeometry(0.06, 6, 6);
            reg.trackGeometry(berryGeo);
            const berryOffsets = [
                [0, radius * 0.78, radius * 0.48],
                [radius * 0.42, radius * 0.72, 0],
                [-radius * 0.38, radius * 0.74, radius * 0.28],
                [radius * 0.22, radius * 0.82, -radius * 0.32],
            ] as const;
            for (const [bx, by, bz] of berryOffsets) {
                const berry = new THREE.Mesh(berryGeo, berryMat);
                berry.position.set(x + bx, by, z + bz);
                berry.castShadow = true;
                group.add(berry);
            }
        }
    }

    return {
        addTree,
        addShrub,
        dispose: () => {
            shadowCtx.dispose();
            lightGreenMat.dispose();
            midGreenMat.dispose();
            darkGreenMat.dispose();
            berryMat.dispose();
        },
    };
}
