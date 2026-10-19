import * as THREE from 'three';
import { type BuildingModel } from '@aihome/bdm';
import { toThreeX, toThreeZ } from '@aihome/render3d';
import { type RoomLabelItem } from '../components/RoomLabelsOverlay.js';

export function computeRoomLabels(
    model: BuildingModel,
    cutawayLevel: number | null,
    camera: THREE.PerspectiveCamera,
    canvas: HTMLCanvasElement,
): readonly RoomLabelItem[] {
    if (cutawayLevel === null) return [];
    const floor = model.floors.find((f) => f.level === cutawayLevel);
    if (!floor) return [];

    const vec = new THREE.Vector3();
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w <= 0 || h <= 0) return [];

    camera.updateMatrixWorld();
    const result: RoomLabelItem[] = [];
    for (const room of floor.rooms) {
        if (room.polygon.length < 3) continue;
        let sumX = 0;
        let sumY = 0;
        for (const pt of room.polygon) {
            sumX += pt.x;
            sumY += pt.y;
        }
        const cx = toThreeX(sumX / room.polygon.length);
        const cy = floor.elevationMm * 0.001 + 0.2;
        const cz = toThreeZ(sumY / room.polygon.length);

        vec.set(cx, cy, cz).project(camera);
        const screenX = Math.round((vec.x * 0.5 + 0.5) * w);
        const screenY = Math.round((-vec.y * 0.5 + 0.5) * h);
        const isInFront =
            vec.z > -1 &&
            vec.z < 1 &&
            screenX >= 20 &&
            screenX <= w - 20 &&
            screenY >= 20 &&
            screenY <= h - 20;

        result.push({
            id: room.id,
            name: `${room.name} (${String(Math.round(room.areaM2 / 1.65))}帖)`,
            x: screenX,
            y: screenY,
            isVisible: isInFront,
        });
    }
    return result;
}
