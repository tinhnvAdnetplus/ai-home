import * as THREE from 'three';
import { type LightPreset } from '../types.js';

function createCloudTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        // Soft cumulus puff lobes with brilliant white top and soft edges
        const lobes = [
            { x: 256, y: 140, rx: 130, ry: 75 },
            { x: 155, y: 150, rx: 95, ry: 65 },
            { x: 355, y: 150, rx: 100, ry: 65 },
            { x: 256, y: 88, rx: 90, ry: 60 },
            { x: 190, y: 98, rx: 80, ry: 55 },
            { x: 325, y: 98, rx: 85, ry: 55 },
            { x: 85, y: 165, rx: 65, ry: 45 },
            { x: 425, y: 165, rx: 65, ry: 45 },
        ];
        for (const lobe of lobes) {
            const grad = ctx.createRadialGradient(
                lobe.x,
                lobe.y - lobe.ry * 0.3,
                lobe.rx * 0.08,
                lobe.x,
                lobe.y,
                lobe.rx,
            );
            grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
            grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.96)');
            grad.addColorStop(0.8, 'rgba(235, 245, 255, 0.65)');
            grad.addColorStop(1, 'rgba(220, 240, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(lobe.x, lobe.y, lobe.rx, lobe.ry, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

export function createSkyClouds(preset: LightPreset): {
    readonly group: THREE.Group;
    readonly dispose: () => void;
} {
    const group = new THREE.Group();
    group.name = 'sky-clouds';
    const texture = createCloudTexture();

    const isSunset = preset === 'sunset';
    const tintColor = new THREE.Color(isSunset ? 0xffdfcb : 0xffffff);

    const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: isSunset ? 0.88 : 0.96,
        color: tintColor,
        depthWrite: false,
        fog: false,
    });

    // 12 soft cloud billboards placed prominently in the sky above horizon hills
    const cloudDefs = [
        { angle: 3.25, radius: 135, y: 36, w: 62, h: 30 },
        { angle: 3.65, radius: 155, y: 44, w: 74, h: 35 },
        { angle: 4.05, radius: 130, y: 38, w: 58, h: 28 },
        { angle: 4.45, radius: 160, y: 48, w: 72, h: 34 },
        { angle: 4.85, radius: 140, y: 40, w: 64, h: 30 },
        { angle: 2.85, radius: 145, y: 42, w: 66, h: 32 },
        { angle: 5.25, radius: 138, y: 36, w: 56, h: 28 },
        { angle: 0.35, radius: 150, y: 44, w: 65, h: 30 },
        { angle: 0.95, radius: 162, y: 50, w: 75, h: 35 },
        { angle: 1.55, radius: 142, y: 38, w: 60, h: 28 },
        { angle: 2.15, radius: 154, y: 46, w: 68, h: 32 },
        { angle: 5.85, radius: 146, y: 44, w: 64, h: 30 },
    ] as const;

    for (const def of cloudDefs) {
        const sprite = new THREE.Sprite(mat);
        const x = Math.cos(def.angle) * def.radius;
        const z = Math.sin(def.angle) * def.radius;
        sprite.position.set(x, def.y, z);
        sprite.scale.set(def.w, def.h, 1);
        sprite.renderOrder = -40;
        group.add(sprite);
    }

    return {
        group,
        dispose: () => {
            texture.dispose();
            mat.dispose();
            group.clear();
        },
    };
}
