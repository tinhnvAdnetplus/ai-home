import type * as THREE from 'three';
import { toThreeX, toThreeZ } from './coords.js';
import { canPlaceBox } from './furniture-bounds.js';
import { addPottedPlant } from './furniture-geom.js';
import {
    buildCoffeeTable,
    buildLivingRug,
    buildSofa,
    buildTvUnit,
} from './furniture-living.js';
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

export function placeLivingSuite(
    ctx: PlacementContext,
    group: THREE.Group,
    reg: MaterialRegistry,
): void {
    const { bounds, elevM } = ctx;
    const wMm = bounds.maxX - bounds.minX;
    const dMm = bounds.maxY - bounds.minY;
    if (dMm < 3200) return;

    const swMm = Math.min(Math.max(wMm * 0.45, 1600), 2000);
    const sdMm = 850;
    const sBox: Box2D = {
        minX: bounds.minX + 400,
        minY: bounds.maxY - 1200 - sdMm,
        maxX: bounds.minX + 400 + swMm,
        maxY: bounds.maxY - 1200,
    };
    tryPlaceItem(sBox, 'sofa', ctx, () => {
        const posX = toThreeX((sBox.minX + sBox.maxX) / 2);
        const posZ = toThreeZ((sBox.minY + sBox.maxY) / 2);
        buildLivingRug(
            group,
            swMm * 0.001 + 0.4,
            1.8,
            { x: posX, y: elevM, z: posZ + 0.4 },
            reg,
        );
        buildSofa(
            group,
            swMm * 0.001,
            sdMm * 0.001,
            { x: posX, y: elevM, z: posZ },
            reg,
        );
        buildCoffeeTable(
            group,
            0.95,
            0.52,
            { x: posX, y: elevM, z: posZ + 0.65 },
            reg,
        );
    });

    const tvwMm = Math.min(swMm, 1400);
    const tvBox: Box2D = {
        minX: bounds.minX + 400,
        minY: bounds.maxY - 450,
        maxX: bounds.minX + 400 + tvwMm,
        maxY: bounds.maxY - 100,
    };
    tryPlaceItem(tvBox, 'tv-unit', ctx, () => {
        const posX = toThreeX((tvBox.minX + tvBox.maxX) / 2);
        const posZ = toThreeZ((tvBox.minY + tvBox.maxY) / 2);
        buildTvUnit(
            group,
            tvwMm * 0.001,
            0.38,
            { x: posX, y: elevM, z: posZ },
            reg,
        );
    });

    const plantBox: Box2D = {
        minX: bounds.maxX - 550,
        minY: bounds.maxY - 550,
        maxX: bounds.maxX - 150,
        maxY: bounds.maxY - 150,
    };
    tryPlaceItem(plantBox, 'living-plant', ctx, () => {
        const posX = toThreeX((plantBox.minX + plantBox.maxX) / 2);
        const posZ = toThreeZ((plantBox.minY + plantBox.maxY) / 2);
        addPottedPlant(group, { x: posX, y: elevM, z: posZ }, reg, 1.0);
    });
}
