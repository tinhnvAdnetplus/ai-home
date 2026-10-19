import * as THREE from 'three';
import { type LightPreset } from '../types.js';

export function createSkyDome(preset: LightPreset): THREE.Mesh {
    const radius = 290;
    const geo = new THREE.SphereGeometry(
        radius,
        32,
        24,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.55,
    );
    const pos = geo.attributes.position;
    const count = pos?.count ?? 0;
    const colors: number[] = [];

    const isSunset = preset === 'sunset';
    const zenithColor = new THREE.Color(isSunset ? 0x2e334d : 0x246ac0);
    const highSkyColor = new THREE.Color(isSunset ? 0x6e435b : 0x4a9be0);
    const midSkyColor = new THREE.Color(isSunset ? 0xb55a3c : 0x7ebfe8);
    const lowSkyColor = new THREE.Color(isSunset ? 0xde8852 : 0xbae0f6);
    const horizonColor = new THREE.Color(isSunset ? 0xffc48a : 0xe4f1fb);
    const groundColor = new THREE.Color(isSunset ? 0xdf9a68 : 0xd8e8f5);

    for (let i = 0; i < count; i += 1) {
        const y = pos?.getY(i) ?? 0;
        const ratio = Math.max(0, Math.min(1, y / radius));
        const c = new THREE.Color();
        if (y < 0) {
            c.copy(groundColor);
        } else if (ratio < 0.05) {
            c.lerpColors(horizonColor, lowSkyColor, ratio / 0.05);
        } else if (ratio < 0.2) {
            c.lerpColors(lowSkyColor, midSkyColor, (ratio - 0.05) / 0.15);
        } else if (ratio < 0.5) {
            c.lerpColors(midSkyColor, highSkyColor, (ratio - 0.2) / 0.3);
        } else {
            c.lerpColors(highSkyColor, zenithColor, (ratio - 0.5) / 0.5);
        }
        colors.push(c.r, c.g, c.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.BackSide,
        depthWrite: false,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, -2, 0);
    mesh.renderOrder = -100;

    return mesh;
}
