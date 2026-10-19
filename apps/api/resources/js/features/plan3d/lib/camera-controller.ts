import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { type SceneBounds } from '@aihome/render3d';
import { type CameraPreset } from '../types.js';

export function setupCameraAndControls(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
): {
    readonly camera: THREE.PerspectiveCamera;
    readonly controls: OrbitControls;
} {
    const aspect = width > 0 && height > 0 ? width / height : 1.5;
    const camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 500);

    const controls = new OrbitControls(camera, canvas);
    const isReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    controls.enableDamping = !isReducedMotion;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minPolarAngle = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 120.0;

    return { camera, controls };
}

function computeFitDistance(
    camera: THREE.PerspectiveCamera,
    bounds: SceneBounds,
    viewDir: THREE.Vector3,
    fillRatio = 0.4,
): number {
    const target = new THREE.Vector3(
        bounds.center.x,
        bounds.center.y,
        bounds.center.z,
    );
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(up, viewDir).normalize();
    const camUp = new THREE.Vector3().crossVectors(viewDir, right).normalize();

    let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
    for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
            for (const z of [bounds.min.z, bounds.max.z]) {
                const px =
                    (x - target.x) * right.x +
                    (y - target.y) * right.y +
                    (z - target.z) * right.z;
                const py =
                    (x - target.x) * camUp.x +
                    (y - target.y) * camUp.y +
                    (z - target.z) * camUp.z;
                minX = Math.min(minX, px);
                maxX = Math.max(maxX, px);
                minY = Math.min(minY, py);
                maxY = Math.max(maxY, py);
            }
        }
    }

    const spanW = Math.max(1, maxX - minX);
    const spanH = Math.max(1, maxY - minY);
    const fovRad = (camera.fov * Math.PI) / 180;
    const halfTan = Math.tan(fovRad / 2);
    const aspect = Math.max(0.3, camera.aspect);

    const distH = spanH / (2 * fillRatio * halfTan);
    const distW = spanW / (2 * fillRatio * halfTan * aspect);
    return Math.max(distH, distW);
}

export function applyCameraPreset(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    bounds: SceneBounds,
    preset: CameraPreset,
): void {
    const isBirdeye = preset === 'birdeye';
    const targetY = isBirdeye
        ? bounds.min.y + Math.min(1.4, bounds.size.y * 0.3)
        : bounds.center.y * 1.0;

    // Exterior: front-left 3/4 view from road side (azimuth ~ -42°, elevation ~ 22.5°)
    const dir = isBirdeye
        ? new THREE.Vector3(-0.42, 0.88, 0.62).normalize()
        : new THREE.Vector3(-0.618, 0.14, 0.687).normalize();

    const planSpan = Math.max(8, Math.hypot(bounds.size.x, bounds.size.z));
    const dist = isBirdeye
        ? Math.min(
              computeFitDistance(camera, bounds, dir, 0.42),
              planSpan * 2.2,
          )
        : computeFitDistance(camera, bounds, dir, 0.5);

    controls.target.set(bounds.center.x, targetY, bounds.center.z);
    camera.position.set(
        bounds.center.x + dir.x * dist,
        targetY + dir.y * dist,
        bounds.center.z + dir.z * dist,
    );

    controls.minDistance = Math.max(1.5, dist * 0.2);
    controls.maxDistance = Math.max(50.0, dist * 3.5);
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minPolarAngle = 0.05;
    controls.update();
}
