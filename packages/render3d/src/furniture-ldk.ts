import type * as THREE from 'three';
import { toThreeX, toThreeZ } from './coords.js';
import { canPlaceBox } from './furniture-bounds.js';
import { buildDiningSet } from './furniture-dining.js';
import {
    buildKitchenIsland,
    buildKitchenRun,
    buildRefrigerator,
} from './furniture-kitchen.js';
import { placeLivingSuite } from './furniture-ldk-living.js';
import { type Box2D, type PlacementContext } from './furniture-types.js';
import { type MaterialRegistry } from './types.js';

function tryPlaceItem(
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

export function placeLdkFurniture(
    ctx: PlacementContext,
    group: THREE.Group,
    reg: MaterialRegistry,
): void {
    const { bounds, elevM } = ctx;
    const wMm = bounds.maxX - bounds.minX;
    const dMm = bounds.maxY - bounds.minY;

    // 1. Kitchen run
    const kwMm = Math.min(Math.max(wMm * 0.45, 1800), 2550);
    const kdMm = 650;
    const kBox: Box2D = {
        minX: bounds.minX + 200,
        minY: bounds.minY + 150,
        maxX: bounds.minX + 200 + kwMm,
        maxY: bounds.minY + 150 + kdMm,
    };
    tryPlaceItem(kBox, 'kitchen-run', ctx, () => {
        const posX = toThreeX((kBox.minX + kBox.maxX) / 2);
        const posZ = toThreeZ((kBox.minY + kBox.maxY) / 2);
        buildKitchenRun(
            group,
            kwMm * 0.001,
            kdMm * 0.001,
            { x: posX, y: elevM, z: posZ },
            reg,
        );
    });

    // 2. Refrigerator
    const rBox: Box2D = {
        minX: kBox.maxX + 100,
        minY: bounds.minY + 150,
        maxX: kBox.maxX + 100 + 680,
        maxY: bounds.minY + 150 + 680,
    };
    tryPlaceItem(rBox, 'refrigerator', ctx, () => {
        const posX = toThreeX((rBox.minX + rBox.maxX) / 2);
        const posZ = toThreeZ((rBox.minY + rBox.maxY) / 2);
        buildRefrigerator(group, { x: posX, y: elevM, z: posZ }, reg);
    });

    // 3. Optional Kitchen Island (if large room)
    if (ctx.room.areaM2 >= 16 && dMm >= 4200) {
        const iwMm = 1400;
        const idMm = 750;
        const iBox: Box2D = {
            minX: bounds.minX + 400,
            minY: kBox.maxY + 850,
            maxX: bounds.minX + 400 + iwMm,
            maxY: kBox.maxY + 850 + idMm,
        };
        tryPlaceItem(iBox, 'kitchen-island', ctx, () => {
            const posX = toThreeX((iBox.minX + iBox.maxX) / 2);
            const posZ = toThreeZ((iBox.minY + iBox.maxY) / 2);
            buildKitchenIsland(
                group,
                iwMm * 0.001,
                idMm * 0.001,
                { x: posX, y: elevM, z: posZ },
                reg,
            );
        });
    }

    // 4. Dining table + 4 chairs
    const dwMm = 1400;
    const ddMm = 800;
    const dMidY = bounds.minY + dMm * 0.48;
    const dBox: Box2D = {
        minX: bounds.minX + wMm * 0.5 - dwMm / 2,
        minY: dMidY - ddMm / 2,
        maxX: bounds.minX + wMm * 0.5 + dwMm / 2,
        maxY: dMidY + ddMm / 2,
    };
    tryPlaceItem(dBox, 'dining-set', ctx, () => {
        const posX = toThreeX((dBox.minX + dBox.maxX) / 2);
        const posZ = toThreeZ((dBox.minY + dBox.maxY) / 2);
        buildDiningSet(
            group,
            dwMm * 0.001,
            ddMm * 0.001,
            { x: posX, y: elevM, z: posZ },
            reg,
        );
    });

    // 5. Living suite
    placeLivingSuite(ctx, group, reg);
}
