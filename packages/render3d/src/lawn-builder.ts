import * as THREE from 'three';
import { type MaterialRegistry } from './types.js';

function createMowingStripeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        const stripeH = 32;
        for (let y = 0; y < 256; y += stripeH) {
            const isAlt = (y / stripeH) % 2 === 1;
            ctx.fillStyle = isAlt ? '#bfdc9f' : '#c9e4ac';
            ctx.fillRect(0, y, 256, stripeH);
        }

        // Soft, fresh mowing grain
        ctx.fillStyle = 'rgba(145, 185, 115, 0.2)';
        for (let i = 0; i < 400; i += 1) {
            const gx = (i * 37) % 256;
            const gy = (i * 59) % 256;
            ctx.fillRect(gx, gy, 1, 3);
        }
        ctx.fillStyle = 'rgba(235, 250, 215, 0.28)';
        for (let i = 0; i < 350; i += 1) {
            const gx = (i * 47) % 256;
            const gy = (i * 71) % 256;
            ctx.fillRect(gx, gy, 1, 2);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

export function buildLawn(
    midX: number,
    midZ: number,
    lotWidth: number,
    lotDepth: number,
    reg: MaterialRegistry,
): {
    readonly group: THREE.Group;
    readonly dispose: () => void;
} {
    const group = new THREE.Group();
    group.name = 'lawn-area';

    const lawnTexture = createMowingStripeTexture();
    const repX = Math.max(3, Math.round(lotWidth / 1.8));
    const repZ = Math.max(4, Math.round(lotDepth / 1.8));
    lawnTexture.repeat.set(repX, repZ);

    const lotMat = new THREE.MeshStandardMaterial({
        map: lawnTexture,
        roughness: 0.86,
        metalness: 0.01,
    });

    const lotGeo = new THREE.PlaneGeometry(lotWidth, lotDepth);
    lotGeo.rotateX(-Math.PI / 2);
    reg.trackGeometry(lotGeo);
    const lotMesh = new THREE.Mesh(lotGeo, lotMat);
    lotMesh.position.set(midX, -0.015, midZ);
    lotMesh.receiveShadow = true;
    group.add(lotMesh);

    const outerLawnTexture = createMowingStripeTexture();
    outerLawnTexture.repeat.set(48, 48);

    const outerMat = new THREE.MeshStandardMaterial({
        map: outerLawnTexture,
        roughness: 0.9,
        metalness: 0.01,
    });

    const outerGeo = new THREE.PlaneGeometry(240, 240);
    outerGeo.rotateX(-Math.PI / 2);
    reg.trackGeometry(outerGeo);
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.position.set(midX, -0.025, midZ);
    outerMesh.receiveShadow = false;
    group.add(outerMesh);

    return {
        group,
        dispose: () => {
            lawnTexture.dispose();
            outerLawnTexture.dispose();
            lotMat.dispose();
            outerMat.dispose();
            group.clear();
        },
    };
}
