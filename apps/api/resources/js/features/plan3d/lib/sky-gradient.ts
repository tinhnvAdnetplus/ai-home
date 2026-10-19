import * as THREE from 'three';
import { type LightPreset } from '../types.js';

export function createSkyTexture(preset: LightPreset): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, 256);
        if (preset === 'sunset') {
            grad.addColorStop(0, '#363d59');
            grad.addColorStop(0.55, '#c87652');
            grad.addColorStop(0.85, '#e8aa78');
            grad.addColorStop(1, '#f4cfab');
        } else {
            grad.addColorStop(0, '#bed9f3');
            grad.addColorStop(0.55, '#dfecf7');
            grad.addColorStop(0.85, '#f0f5fa');
            grad.addColorStop(1, '#f7fafc');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 256);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
}
