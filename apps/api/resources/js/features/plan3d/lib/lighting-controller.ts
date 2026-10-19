import * as THREE from 'three';
import { type LightPreset } from '../types.js';
import { createSkyClouds } from './sky-clouds.js';
import { createSkyDome } from './sky-dome.js';

export type LightingRig = {
    readonly ambient: THREE.HemisphereLight;
    readonly sun: THREE.DirectionalLight;
    readonly fill: THREE.DirectionalLight;
    readonly setPreset: (preset: LightPreset) => void;
    readonly dispose: () => void;
};

export function setupLighting(
    scene: THREE.Scene,
    isShadowEnabled: boolean,
): LightingRig {
    const ambient = new THREE.HemisphereLight(0xdff1ff, 0xcfe6b8, 1.15);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffaee, 1.65);
    sun.position.set(22, 28, 18);

    if (isShadowEnabled) {
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 1.0;
        sun.shadow.camera.far = 85;
        sun.shadow.bias = -0.0003;
        sun.shadow.normalBias = 0.02;
        sun.shadow.radius = 2.5;
        sun.shadow.camera.left = -26;
        sun.shadow.camera.right = 26;
        sun.shadow.camera.top = 26;
        sun.shadow.camera.bottom = -26;
    }
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0xe4effb, 0.45);
    fill.position.set(-18, 18, -18);
    scene.add(fill);

    let skyDome: THREE.Mesh | null = null;
    let cloudsRig: {
        readonly group: THREE.Group;
        readonly dispose: () => void;
    } | null = null;

    function cleanupSky(): void {
        if (skyDome) {
            scene.remove(skyDome);
            skyDome.geometry.dispose();
            if (Array.isArray(skyDome.material)) {
                for (const m of skyDome.material) m.dispose();
            } else {
                skyDome.material.dispose();
            }
            skyDome = null;
        }
        if (cloudsRig) {
            scene.remove(cloudsRig.group);
            cloudsRig.dispose();
            cloudsRig = null;
        }
    }

    function setPreset(preset: LightPreset): void {
        cleanupSky();

        const isSunset = preset === 'sunset';
        const fogColor = isSunset ? 0xffd094 : 0xe4f1fb;
        scene.fog = new THREE.Fog(fogColor, 75, 260);

        skyDome = createSkyDome(preset);
        scene.add(skyDome);

        cloudsRig = createSkyClouds(preset);
        scene.add(cloudsRig.group);

        if (isSunset) {
            ambient.color.setHex(0xa59fb2);
            ambient.groundColor.setHex(0x5e4b3d);
            ambient.intensity = 0.75;
            sun.color.setHex(0xff7838);
            sun.intensity = 1.6;
            sun.position.set(26, 9, 14);
            fill.color.setHex(0x5c4d66);
            fill.intensity = 0.3;
        } else {
            ambient.color.setHex(0xdff1ff);
            ambient.groundColor.setHex(0xcfe6b8);
            ambient.intensity = 1.15;
            sun.color.setHex(0xfffaee);
            sun.intensity = 1.65;
            sun.position.set(22, 28, 18);
            fill.color.setHex(0xe4effb);
            fill.intensity = 0.45;
        }
    }

    return {
        ambient,
        sun,
        fill,
        setPreset,
        dispose: () => {
            cleanupSky();
            scene.fog = null;
            scene.remove(ambient, sun, fill);
        },
    };
}
