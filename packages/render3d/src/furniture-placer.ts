import type * as THREE from 'three';
import { toThreeX, toThreeZ } from './coords.js';
import { canPlaceBox } from './furniture-bounds.js';
import { buildDiningSet } from './furniture-dining.js';
import { buildKitchenRun, buildRefrigerator } from './furniture-kitchen.js';
import { placeLdkFurniture } from './furniture-ldk.js';
import { placeBedroom, placeChildRoom } from './furniture-rooms-bed.js';
import {
    placeEntrance,
    placeToilet,
    placeWashAndBath,
    placeWashitsu,
} from './furniture-rooms-wet.js';
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

export function placeRoomFurniture(
    ctx: PlacementContext,
    group: THREE.Group,
    reg: MaterialRegistry,
): void {
    const { bounds, elevM, room } = ctx;
    const wMm = bounds.maxX - bounds.minX;
    const dMm = bounds.maxY - bounds.minY;
    const t = room.type;

    if (t === 'ldk' || t === 'living') {
        placeLdkFurniture(ctx, group, reg);
    } else if (t === 'dining') {
        const dw = Math.min(1400, wMm * 0.7);
        const dd = Math.min(800, dMm * 0.7);
        const b: Box2D = {
            minX: bounds.minX + (wMm - dw) / 2,
            minY: bounds.minY + (dMm - dd) / 2,
            maxX: bounds.minX + (wMm + dw) / 2,
            maxY: bounds.minY + (dMm + dd) / 2,
        };
        tryPlace(b, 'dining-set', ctx, () => {
            buildDiningSet(
                group,
                dw * 0.001,
                dd * 0.001,
                {
                    x: toThreeX((b.minX + b.maxX) / 2),
                    y: elevM,
                    z: toThreeZ((b.minY + b.maxY) / 2),
                },
                reg,
            );
        });
    } else if (t === 'kitchen') {
        const kw = Math.min(2400, wMm - 400);
        const b: Box2D = {
            minX: bounds.minX + 200,
            minY: bounds.minY + 150,
            maxX: bounds.minX + 200 + kw,
            maxY: bounds.minY + 800,
        };
        tryPlace(b, 'kitchen-run', ctx, () => {
            buildKitchenRun(
                group,
                kw * 0.001,
                0.65,
                {
                    x: toThreeX((b.minX + b.maxX) / 2),
                    y: elevM,
                    z: toThreeZ((b.minY + b.maxY) / 2),
                },
                reg,
            );
        });
        const rb: Box2D = {
            minX: b.maxX + 100,
            minY: bounds.minY + 150,
            maxX: b.maxX + 780,
            maxY: bounds.minY + 830,
        };
        tryPlace(rb, 'fridge', ctx, () => {
            buildRefrigerator(
                group,
                {
                    x: toThreeX((rb.minX + rb.maxX) / 2),
                    y: elevM,
                    z: toThreeZ((rb.minY + rb.maxY) / 2),
                },
                reg,
            );
        });
    } else if (t === 'bedroom') {
        placeBedroom(ctx, group, reg);
    } else if (t === 'childRoom' || t === 'study') {
        placeChildRoom(ctx, group, reg);
    } else if (t === 'washitsu') {
        placeWashitsu(ctx, group, reg);
    } else if (t === 'toilet') {
        placeToilet(ctx, group, reg);
    } else if (t === 'wash' || t === 'laundry' || t === 'bath') {
        placeWashAndBath(ctx, group, reg);
    } else if (t === 'entrance') {
        placeEntrance(ctx, group, reg);
    }
}
