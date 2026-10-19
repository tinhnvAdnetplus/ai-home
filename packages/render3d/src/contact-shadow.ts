import * as THREE from 'three';

export type ContactShadowContext = {
    readonly createShadowMesh: (
        width: number,
        depth: number,
        opacity?: number,
    ) => THREE.Mesh;
    readonly dispose: () => void;
};

export function createContactShadowContext(): ContactShadowContext {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(18, 22, 28, 0.62)');
        grad.addColorStop(0.35, 'rgba(22, 28, 36, 0.4)');
        grad.addColorStop(0.7, 'rgba(30, 38, 48, 0.12)');
        grad.addColorStop(1, 'rgba(30, 38, 48, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const materials: THREE.MeshBasicMaterial[] = [];
    const geometries: THREE.BufferGeometry[] = [];

    function createShadowMesh(
        width: number,
        depth: number,
        opacity = 0.5,
    ): THREE.Mesh {
        const geo = new THREE.PlaneGeometry(width, depth);
        geo.rotateX(-Math.PI / 2);
        geometries.push(geo);

        const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity,
            depthWrite: false,
        });
        materials.push(mat);

        const mesh = new THREE.Mesh(geo, mat);
        mesh.renderOrder = 1;
        return mesh;
    }

    return {
        createShadowMesh,
        dispose: () => {
            texture.dispose();
            for (const m of materials) m.dispose();
            for (const g of geometries) g.dispose();
        },
    };
}
