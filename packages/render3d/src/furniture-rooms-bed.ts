import type * as THREE from 'three';
import { toThreeX, toThreeZ } from './coords.js';
import {
    buildBed,
    buildStudyDesk,
    buildWardrobe,
} from './furniture-bedroom.js';
import { cornerBoxes, tryFirstFit } from './furniture-fit.js';
import { type PlacementContext } from './furniture-types.js';
import { type MaterialRegistry } from './types.js';

export function placeBedroom(
    ctx: PlacementContext,
    group: THREE.Group,
    reg: MaterialRegistry,
): void {
    const { bounds, elevM } = ctx;
    const wMm = bounds.maxX - bounds.minX;
    const dMm = bounds.maxY - bounds.minY;

    const bw = Math.min(1500, wMm - 400);
    const bd = Math.min(2050, dMm - 400);
    tryFirstFit(cornerBoxes(bounds, bw, bd, 250), 'double-bed', ctx, (bBox) => {
        buildBed(
            group,
            bw * 0.001,
            bd * 0.001,
            {
                x: toThreeX((bBox.minX + bBox.maxX) / 2),
                y: elevM,
                z: toThreeZ((bBox.minY + bBox.maxY) / 2),
            },
            true,
            reg,
        );
    });

    if (wMm >= 3000) {
        tryFirstFit(
            cornerBoxes(bounds, 1100, 600, 100),
            'wardrobe',
            ctx,
            (wBox) => {
                buildWardrobe(
                    group,
                    1.1,
                    0.6,
                    {
                        x: toThreeX((wBox.minX + wBox.maxX) / 2),
                        y: elevM,
                        z: toThreeZ((wBox.minY + wBox.maxY) / 2),
                    },
                    reg,
                );
            },
        );
    }
}

export function placeChildRoom(
    ctx: PlacementContext,
    group: THREE.Group,
    reg: MaterialRegistry,
): void {
    const { bounds, elevM } = ctx;
    const wMm = bounds.maxX - bounds.minX;
    const dMm = bounds.maxY - bounds.minY;

    const bw = Math.min(1000, wMm - 300);
    const bd = Math.min(1950, dMm - 300);
    tryFirstFit(cornerBoxes(bounds, bw, bd, 200), 'single-bed', ctx, (bBox) => {
        buildBed(
            group,
            bw * 0.001,
            bd * 0.001,
            {
                x: toThreeX((bBox.minX + bBox.maxX) / 2),
                y: elevM,
                z: toThreeZ((bBox.minY + bBox.maxY) / 2),
            },
            false,
            reg,
        );
    });

    tryFirstFit(cornerBoxes(bounds, 1050, 550, 100), 'desk', ctx, (dBox) => {
        buildStudyDesk(
            group,
            1.05,
            0.55,
            {
                x: toThreeX((dBox.minX + dBox.maxX) / 2),
                y: elevM,
                z: toThreeZ((dBox.minY + dBox.maxY) / 2),
            },
            reg,
        );
    });
}
