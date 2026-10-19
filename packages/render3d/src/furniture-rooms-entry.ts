import type * as THREE from 'three';
import { toThreeX, toThreeZ } from './coords.js';
import { canPlaceBox } from './furniture-bounds.js';
import {
    buildShoesCabinet,
    buildWashitsuTable,
} from './furniture-entry-washitsu.js';
import { addPottedPlant } from './furniture-geom.js';
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

export function placeWashitsu(
    ctx: PlacementContext,
    group: THREE.Group,
    reg: MaterialRegistry,
): void {
    const { bounds, elevM } = ctx;
    const wMm = bounds.maxX - bounds.minX;
    const dMm = bounds.maxY - bounds.minY;
    const tb: Box2D = {
        minX: bounds.minX + wMm / 2 - 450,
        minY: bounds.minY + dMm / 2 - 380,
        maxX: bounds.minX + wMm / 2 + 450,
        maxY: bounds.minY + dMm / 2 + 380,
    };
    tryPlace(tb, 'zataku', ctx, () => {
        const posX = toThreeX((tb.minX + tb.maxX) / 2);
        const posZ = toThreeZ((tb.minY + tb.maxY) / 2);
        buildWashitsuTable(
            group,
            0.9,
            0.76,
            { x: posX, y: elevM, z: posZ },
            reg,
        );
    });
}

export function placeEntrance(
    ctx: PlacementContext,
    group: THREE.Group,
    reg: MaterialRegistry,
): void {
    const { bounds, elevM } = ctx;
    const sb: Box2D = {
        minX: bounds.minX + 100,
        minY: bounds.minY + 100,
        maxX: bounds.minX + 1000,
        maxY: bounds.minY + 480,
    };
    tryPlace(sb, 'shoes-cabinet', ctx, () => {
        const posX = toThreeX((sb.minX + sb.maxX) / 2);
        const posZ = toThreeZ((sb.minY + sb.maxY) / 2);
        buildShoesCabinet(
            group,
            0.9,
            0.38,
            { x: posX, y: elevM, z: posZ },
            reg,
        );
    });

    const pb: Box2D = {
        minX: bounds.maxX - 450,
        minY: bounds.minY + 100,
        maxX: bounds.maxX - 100,
        maxY: bounds.minY + 450,
    };
    tryPlace(pb, 'entry-plant', ctx, () => {
        const posX = toThreeX((pb.minX + pb.maxX) / 2);
        const posZ = toThreeZ((pb.minY + pb.maxY) / 2);
        addPottedPlant(group, { x: posX, y: elevM, z: posZ }, reg, 0.85);
    });
}
