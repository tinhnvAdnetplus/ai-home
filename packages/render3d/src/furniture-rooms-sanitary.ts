import type * as THREE from 'three';
import { toThreeX, toThreeZ } from './coords.js';
import { canPlaceBox } from './furniture-bounds.js';
import {
    buildBathtub,
    buildToilet,
    buildWashbasin,
    buildWashingMachine,
} from './furniture-sanitary.js';
import { type Box2D, type PlacementContext } from './furniture-types.js';
import { type MaterialRegistry } from './types.js';

function tryPlace(
    box: Box2D,
    name: string,
    ctx: PlacementContext,
    buildFn: () => void,
): boolean {
    if (!canPlaceBox(box, ctx)) {
        ctx.stats.skippedCount += 1;
        return false;
    }
    buildFn();
    ctx.placed.push({ name, box });
    ctx.stats.placedCount += 1;
    return true;
}

export function placeToilet(
    ctx: PlacementContext,
    group: THREE.Group,
    reg: MaterialRegistry,
): void {
    const { bounds, elevM } = ctx;
    const wMm = bounds.maxX - bounds.minX;
    const tb: Box2D = {
        minX: bounds.minX + (wMm - 420) / 2,
        minY: bounds.minY + 150,
        maxX: bounds.minX + (wMm + 420) / 2,
        maxY: bounds.minY + 800,
    };
    tryPlace(tb, 'toilet', ctx, () => {
        const posX = toThreeX((tb.minX + tb.maxX) / 2);
        const posZ = toThreeZ((tb.minY + tb.maxY) / 2);
        buildToilet(group, { x: posX, y: elevM, z: posZ }, reg);
    });
}

export function placeWashAndBath(
    ctx: PlacementContext,
    group: THREE.Group,
    reg: MaterialRegistry,
): void {
    const { bounds, elevM, room } = ctx;
    const wMm = bounds.maxX - bounds.minX;
    const dMm = bounds.maxY - bounds.minY;

    if (room.type === 'wash' || room.type === 'laundry') {
        const wb: Box2D = {
            minX: bounds.minX + 150,
            minY: bounds.minY + 150,
            maxX: bounds.minX + 950,
            maxY: bounds.minY + 700,
        };
        tryPlace(wb, 'washbasin', ctx, () => {
            const posX = toThreeX((wb.minX + wb.maxX) / 2);
            const posZ = toThreeZ((wb.minY + wb.maxY) / 2);
            buildWashbasin(
                group,
                0.8,
                0.55,
                { x: posX, y: elevM, z: posZ },
                reg,
            );
        });

        const mb: Box2D = {
            minX: bounds.maxX - 770,
            minY: bounds.minY + 150,
            maxX: bounds.maxX - 150,
            maxY: bounds.minY + 770,
        };
        tryPlace(mb, 'washing-machine', ctx, () => {
            const posX = toThreeX((mb.minX + mb.maxX) / 2);
            const posZ = toThreeZ((mb.minY + mb.maxY) / 2);
            buildWashingMachine(group, { x: posX, y: elevM, z: posZ }, reg);
        });
    } else if (room.type === 'bath') {
        const bw = Math.min(1450, wMm - 200);
        const bd = Math.min(800, dMm - 200);
        const bb: Box2D = {
            minX: bounds.minX + 100,
            minY: bounds.maxY - bd - 100,
            maxX: bounds.minX + 100 + bw,
            maxY: bounds.maxY - 100,
        };
        tryPlace(bb, 'bathtub', ctx, () => {
            const posX = toThreeX((bb.minX + bb.maxX) / 2);
            const posZ = toThreeZ((bb.minY + bb.maxY) / 2);
            buildBathtub(
                group,
                bw * 0.001,
                bd * 0.001,
                { x: posX, y: elevM, z: posZ },
                reg,
            );
        });
    }
}
