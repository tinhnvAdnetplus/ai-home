import * as THREE from 'three';
import { type SceneBounds } from '@aihome/render3d';
import { type LightPreset } from '../types.js';
import { createSkyClouds } from './sky-clouds.js';
import { createSkyDome } from './sky-dome.js';

export type LightingRig = {
    readonly ambient: THREE.HemisphereLight;
    readonly sun: THREE.DirectionalLight;
    readonly fill: THREE.DirectionalLight;
    readonly setPreset: (preset: LightPreset) => void;
    /** Aim the sun and size its shadow frustum on the building (keeps the preset's direction). */
    readonly fitToBounds: (bounds: SceneBounds) => void;
    readonly dispose: () => void;
};

const DAY_SUN_OFFSET = new THREE.Vector3(22, 28, 18);
const SUNSET_SUN_OFFSET = new THREE.Vector3(26, 9, 14);
/** Shadow frustum half-size: the building plus a margin for site objects, never below the old fixed 26 m. */
const MIN_SHADOW_HALF_M = 26;
const SHADOW_MARGIN_M = 12;

export function setupLighting(
    scene: THREE.Scene,
    isShadowEnabled: boolean,
): LightingRig {
    const ambient = new THREE.HemisphereLight(0xdff1ff, 0xcfe6b8, 1.15);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffaee, 1.65);
    sun.position.copy(DAY_SUN_OFFSET);
    scene.add(sun.target);
    const aim = new THREE.Vector3();
    let sunOffset = DAY_SUN_OFFSET;

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
            sunOffset = SUNSET_SUN_OFFSET;
            fill.color.setHex(0x5c4d66);
            fill.intensity = 0.3;
        } else {
            ambient.color.setHex(0xdff1ff);
            ambient.groundColor.setHex(0xcfe6b8);
            ambient.intensity = 1.15;
            sun.color.setHex(0xfffaee);
            sun.intensity = 1.65;
            sunOffset = DAY_SUN_OFFSET;
            fill.color.setHex(0xe4effb);
            fill.intensity = 0.45;
        }
        sun.position.copy(aim).add(sunOffset);
    }

    function fitToBounds(bounds: SceneBounds): void {
        aim.set(bounds.center.x, 0, bounds.center.z);
        sun.target.position.copy(aim);
        sun.position.copy(aim).add(sunOffset);
        const half = Math.max(
            MIN_SHADOW_HALF_M,
            Math.max(bounds.size.x, bounds.size.z) / 2 + SHADOW_MARGIN_M,
        );
        const cam = sun.shadow.camera;
        cam.left = -half;
        cam.right = half;
        cam.top = half;
        cam.bottom = -half;
        cam.far = sunOffset.length() + half * 2;
        cam.updateProjectionMatrix();
    }

    return {
        ambient,
        sun,
        fill,
        setPreset,
        fitToBounds,
        dispose: () => {
            cleanupSky();
            scene.fog = null;
            scene.remove(ambient, sun, sun.target, fill);
        },
    };
}
