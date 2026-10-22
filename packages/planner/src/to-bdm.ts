import {
    type BuildingModel,
    type Floor,
    type Room,
    type Stair,
    type BdmIssue,
    type Fixture,
    stackStoreyElevations,
    storeyHeightForLevel,
} from '@aihome/bdm';
import { type GridRoom, type PlanInput } from './types.js';
import { type DoorSpec } from './circulation.js';
import { type WindowSpec } from './openings.js';
import { buildWallsAndOpenings } from './wall-generator.js';
import { createStairElement } from './stairs.js';
import { splitConnectedRects } from './room-components.js';
import { frontDistanceM, rearSetbackM } from './site-layout.js';
import { rectsToPolygon } from './polygon-builder.js';
import { generateFloorFixtures } from './fixtures-generator.js';
import { doorClearZone, isDoorKind } from './solid-validator.js';
import { type AiLayoutExterior } from './ai-layout-schema.js';
import { assembleExteriorBdm } from './ai-layout-exterior-convert.js';

export type PlanFloorData = {
    readonly level: number;
    readonly name: string;
    readonly gridD: number;
    readonly rooms: readonly GridRoom[];
    readonly doors: readonly DoorSpec[];
    readonly windows: readonly WindowSpec[];
    /** When set (AI-authored furniture), used as-is instead of `generateFloorFixtures`. */
    readonly fixturesOverride?: readonly Fixture[] | undefined;
};

function roomToPolygon(
    r: GridRoom,
    gridMm: number,
): { x: number; y: number }[] {
    return rectsToPolygon(r.rects, gridMm);
}

export function convertToBdm(
    v: PlanInput,
    W: number,
    floorData: readonly PlanFloorData[],
    gridMm: number,
    seed: number,
    warnings: readonly BdmIssue[],
    aiExt?: AiLayoutExterior,
): BuildingModel {
    const frontageMm = Math.round(v.frontage * 1000);
    const depthMm = Math.round(v.landDepth * 1000);
    const frontMm = Math.round(frontDistanceM(v) * 1000);

    // Canonical Z: each storey starts where the one below ends (see bdm coordinates.ts).
    const storeyHeights = floorData.map((f) => storeyHeightForLevel(f.level));
    const elevations = stackStoreyElevations(storeyHeights);

    const bdmFloors: Floor[] = floorData.map((f, floorIndex) => {
        const { walls, openings } = buildWallsAndOpenings(
            f.level,
            W,
            f.gridD,
            gridMm,
            f.doors,
            f.windows,
            f.rooms,
        );
        const cellM2 = (gridMm / 1000) * (gridMm / 1000);
        const rooms: Room[] = f.rooms.flatMap((r) =>
            splitConnectedRects(r.rects).map((rects, i) => ({
                id: i === 0 ? r.id : `${r.id}-c${i.toString()}`,
                type: r.type,
                name: r.name,
                polygon: roomToPolygon({ ...r, rects }, gridMm),
                areaM2:
                    Math.round(
                        rects.reduce((a, c) => a + c.w * c.h, 0) *
                            cellM2 *
                            1000,
                    ) / 1000,
            })),
        );
        const stairs: Stair[] = [];
        const stairRoom = f.rooms.find((r) => r.type === 'stairs');
        if (stairRoom && f.level < floorData.length) {
            const stairElem = createStairElement(stairRoom, f.level, gridMm);
            if (stairElem) stairs.push(stairElem);
        }

        const doorZones = openings.filter(isDoorKind).flatMap((op) => {
            const wall = walls.find((w) => w.id === op.wallId);
            const zone = wall ? doorClearZone(wall, op, { rooms }) : null;
            return zone ? [zone] : [];
        });
        const fixtures =
            f.fixturesOverride ??
            generateFloorFixtures(f.level, f.rooms, v, gridMm, doorZones);

        return {
            level: f.level,
            elevationMm: elevations[floorIndex] ?? 0,
            heightMm:
                storeyHeights[floorIndex] ?? storeyHeightForLevel(f.level),
            rooms,
            walls: [...walls],
            openings: [...openings],
            fixtures: [...fixtures],
            stairs,
        };
    });

    const f1 = floorData[0];
    const { roof, parking, exterior } = assembleExteriorBdm({
        v,
        W,
        D1: f1?.gridD ?? 0,
        rooms1F: f1?.rooms ?? [],
        gridMm,
        frontageMm,
        depthMm,
        frontMm,
        aiExt,
    });

    return {
        schemaVersion: 1,
        meta: {
            generator: '@aihome/planner v1.0',
            seed,
            inputHash: `seed-${seed.toString()}-${frontageMm.toString()}x${depthMm.toString()}-${v.floors.toString()}F-${v.targetArea.toString()}tsubo-${v.ldkSize.toString()}ldk-${v.masterSize.toString()}ms-${v.kidsSize.toString()}ks-${v.exteriorStyle ?? ''}-${v.interiorStyle ?? ''}-${v.kitchenType ?? ''}-${v.bathSize}-${v.toilets.toString()}wc-${v.cars.toString()}cars-${v.parkingType ?? ''}-${v.roofType ?? ''}-${v.tatamiRoom ?? ''}-${v.wfh ?? ''}-${(v.adults ?? 2).toString()}a${(v.children ?? 2).toString()}c-${v.surroundings?.join(',') ?? ''}-${v.washCount.toString()}wash-${v.waterOpts?.join(',') ?? ''}-${v.storageOpts?.join(',') ?? ''}-${v.extraRooms?.join(',') ?? ''}-${v.outdoorOpts?.join(',') ?? ''}-${v.landShape ?? ''}`,
        },
        site: {
            boundary: [
                { x: -500, y: -frontMm },
                { x: frontageMm - 500, y: -frontMm },
                { x: frontageMm - 500, y: depthMm - frontMm },
                { x: -500, y: depthMm - frontMm },
            ],
            areaM2: Math.round(v.landAreaTsubo * 3.305785 * 100) / 100,
            road: {
                side: v.roadSide,
                widthMm: 4000,
            },
            setbacks: {
                frontMm: v.setbackMode === 'tight' ? 500 : 1000,
                rearMm: Math.round(rearSetbackM(v) * 1000),
                leftMm: 500,
                rightMm: 500,
            },
        },
        floors: bdmFloors,
        roof,
        parking,
        exterior,
        warnings: [...warnings],
    };
}
