import * as THREE from 'three';
import { type BuildingModel } from '@aihome/bdm';
import { MM_TO_M } from '@aihome/render3d';
import {
    buildColliders,
    isInsideStairs,
    resolveCollisions,
} from './walk-colliders.js';
import { computeWalkStart, findFloor } from './walk-start.js';

export type WalkInput = 'forward' | 'back' | 'left' | 'right' | 'run';
export type WalkController = {
    readonly update: (dtSec: number) => void;
    readonly setInput: (input: WalkInput, isOn: boolean) => void;
    readonly dispose: () => void;
};
type Options = {
    readonly camera: THREE.PerspectiveCamera;
    readonly scene: THREE.Scene;
    readonly canvas: HTMLCanvasElement;
    readonly model: BuildingModel;
    readonly level: number;
    readonly onStairHint: (targetLevel: number | null) => void;
};

const KEYS: Readonly<Record<string, WalkInput>> = {
    KeyW: 'forward',
    ArrowUp: 'forward',
    KeyS: 'back',
    ArrowDown: 'back',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    ShiftLeft: 'run',
    ShiftRight: 'run',
};
const EYE = 1.55;
const RADIUS = 0.26;

export function createWalkController(o: Options): WalkController {
    const floor = findFloor(o.model, o.level);
    const segments = floor ? buildColliders(floor) : [];
    const start = computeWalkStart(o.model, o.level);
    const baseY = (floor?.elevationMm ?? 0) * MM_TO_M + EYE;
    const maxLevel = Math.max(...o.model.floors.map((f) => f.level));
    const pos = { x: start.x, z: start.z };
    const look = { yaw: start.yaw, pitch: 0 };
    const input = new Set<WalkInput>();
    let walked = 0;
    let hint: number | null = null;
    o.camera.rotation.order = 'YXZ';
    o.camera.fov = 70;
    o.camera.near = 0.05;
    o.camera.updateProjectionMatrix();
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const lamp = new THREE.PointLight(0xfff1dc, 14, 11, 1.4);
    o.camera.add(lamp);
    o.scene.add(ambient, o.camera);

    const onKey =
        (isDown: boolean) =>
        (e: KeyboardEvent): void => {
            const k = KEYS[e.code];
            if (!k) return;
            if (isDown) input.add(k);
            else input.delete(k);
            e.preventDefault();
        };
    const [onDown, onUp] = [onKey(true), onKey(false)];
    let drag: { x: number; y: number } | null = null;
    const onPtrDown = (e: PointerEvent): void => {
        drag = { x: e.clientX, y: e.clientY };
        o.canvas.setPointerCapture(e.pointerId);
    };
    const onPtrMove = (e: PointerEvent): void => {
        if (!drag) return;
        look.yaw -= (e.clientX - drag.x) * 0.005;
        look.pitch = Math.max(
            -1.2,
            Math.min(1.2, look.pitch - (e.clientY - drag.y) * 0.004),
        );
        drag = { x: e.clientX, y: e.clientY };
    };
    const onPtrUp = (): void => {
        drag = null;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    o.canvas.addEventListener('pointerdown', onPtrDown);
    o.canvas.addEventListener('pointermove', onPtrMove);
    o.canvas.addEventListener('pointerup', onPtrUp);
    o.canvas.addEventListener('pointercancel', onPtrUp);

    const update = (dt: number): void => {
        const step = (input.has('run') ? 4.2 : 1.9) * Math.min(dt, 0.1);
        const fwd = Number(input.has('forward')) - Number(input.has('back'));
        const side = Number(input.has('right')) - Number(input.has('left'));
        const [sy, cy] = [Math.sin(look.yaw), Math.cos(look.yaw)];
        const [dx, dz] = [-sy * fwd + cy * side, -cy * fwd - sy * side];
        const norm = Math.hypot(dx, dz);
        if (norm > 0) {
            pos.x += (dx / norm) * step;
            pos.z += (dz / norm) * step;
            resolveCollisions(pos, RADIUS, segments);
            walked = Math.max(
                walked,
                Math.hypot(pos.x - start.x, pos.z - start.z),
            );
        }
        o.camera.position.set(pos.x, baseY, pos.z);
        o.camera.rotation.set(look.pitch, look.yaw, 0);
        const isOnStairs =
            !!floor && walked > 1.4 && isInsideStairs(floor, pos.x, pos.z);
        const next = !isOnStairs
            ? null
            : o.level < maxLevel
              ? o.level + 1
              : o.level > 1
                ? o.level - 1
                : null;
        if (next !== hint) {
            hint = next;
            o.onStairHint(next);
        }
    };
    return {
        update,
        setInput: (k, isOn) => {
            if (isOn) input.add(k);
            else input.delete(k);
        },
        dispose: () => {
            o.scene.remove(ambient, o.camera);
            o.camera.remove(lamp);
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
            o.canvas.removeEventListener('pointerdown', onPtrDown);
            o.canvas.removeEventListener('pointermove', onPtrMove);
            o.canvas.removeEventListener('pointerup', onPtrUp);
            o.canvas.removeEventListener('pointercancel', onPtrUp);
        },
    };
}
