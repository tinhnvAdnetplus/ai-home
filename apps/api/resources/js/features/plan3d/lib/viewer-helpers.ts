import * as THREE from 'three';
import { type CameraPreset, type LightPreset } from '../types.js';

export function createThreeRenderer(
    canvas: HTMLCanvasElement,
    isLow: boolean,
): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isLow,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
    });
    renderer.shadowMap.enabled = !isLow;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isLow ? 1 : Math.min(window.devicePixelRatio, 2));
    return renderer;
}

export function checkIsLowEnd(): boolean {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
        return true;
    }
    const cores = navigator.hardwareConcurrency;
    const dpr = window.devicePixelRatio;
    return cores <= 4 || dpr < 1.2;
}

export function teardownThreeResources(
    resources: readonly { dispose: () => void }[],
    scene: THREE.Scene,
): void {
    for (const r of resources) {
        r.dispose();
    }
    scene.clear();
}

export function downloadCanvasBlob(canvas: HTMLCanvasElement): void {
    canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'aihome-plan3d.png';
        link.click();
        URL.revokeObjectURL(url);
    }, 'image/png');
}

export function parseDemoQueryParams(): {
    readonly presetId: string;
    readonly cutawayLevel: number | null;
    readonly cameraPreset: CameraPreset;
    readonly lightPreset: LightPreset;
} {
    if (typeof window === 'undefined') {
        return {
            presetId: 'preset-2',
            cutawayLevel: null,
            cameraPreset: 'exterior',
            lightPreset: 'day',
        };
    }
    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    const search = qIndex >= 0 ? hash.slice(qIndex) : window.location.search;
    const params = new URLSearchParams(search);
    const presetParam = params.get('preset');
    const presetId =
        presetParam === 'preset-1' || presetParam === 'preset-3'
            ? presetParam
            : 'preset-2';

    const cutParam = params.get('cutaway') ?? params.get('floor');
    const cutawayLevel = cutParam !== null ? Number(cutParam) : null;

    const camParam = params.get('camera') ?? params.get('view');
    const cameraPreset: CameraPreset =
        camParam === 'birdeye' || camParam === 'dollhouse'
            ? 'birdeye'
            : camParam === 'walk'
              ? 'walk'
              : 'exterior';

    const lightParam = params.get('light');
    const lightPreset: LightPreset = lightParam === 'sunset' ? 'sunset' : 'day';

    return { presetId, cutawayLevel, cameraPreset, lightPreset };
}
