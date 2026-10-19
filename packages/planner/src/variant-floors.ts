import { type Fixture } from '@aihome/bdm';
import {
    type GridRoom,
    type PlanSummary,
    type PlanInput,
    type PlanScore,
} from './types.js';
import { type PlannerConfig } from './config.js';
import { type PlanFloorData } from './to-bdm.js';
import { buildDoors, type DoorSpec } from './circulation.js';
import { buildWindows, type WindowSpec } from './openings.js';
import { estimateCost, scorePlan } from './scoring.js';

export function buildVariantFloorData(
    floors: readonly {
        name: string;
        gridD: number;
        rooms: readonly GridRoom[];
        /** When set (AI-authored doors), used as-is instead of running `buildDoors`. */
        doorsOverride?: readonly DoorSpec[] | undefined;
        /** When set (AI-authored furniture), used as-is instead of `generateFloorFixtures`. */
        fixturesOverride?: readonly Fixture[] | undefined;
        /** When set (AI-authored exterior windows), used as-is instead of `buildWindows`. */
        windowsOverride?: readonly WindowSpec[] | undefined;
    }[],
    W: number,
): {
    floorData: PlanFloorData[];
    allRooms: GridRoom[];
    isolatedRooms: string[];
} {
    const floorData: PlanFloorData[] = [];
    const allRooms: GridRoom[] = [];
    const isolatedRooms: string[] = [];

    for (const [idx, fl] of floors.entries()) {
        const computed =
            fl.doorsOverride === undefined ? buildDoors(fl.rooms) : undefined;
        const doors = fl.doorsOverride ?? computed?.doors ?? [];
        const isolated = computed?.isolated ?? [];
        const windows =
            fl.windowsOverride && fl.windowsOverride.length > 0
                ? fl.windowsOverride
                : buildWindows(fl.rooms, W, fl.gridD);
        for (const r of fl.rooms) allRooms.push(r);
        for (const iso of isolated) isolatedRooms.push(iso);

        floorData.push({
            level: idx + 1,
            name: fl.name,
            gridD: fl.gridD,
            rooms: fl.rooms,
            doors,
            windows,
            fixturesOverride: fl.fixturesOverride,
        });
    }

    return { floorData, allRooms, isolatedRooms };
}


export function calcVariantAreasAndScore(args: {
    allRooms: readonly GridRoom[];
    W: number;
    D1: number;
    v: PlanInput;
    config: PlannerConfig;
    customWeights?:
        | {
              housework: number;
              storage: number;
              daylight: number;
              budget: number;
          }
        | undefined;
}): {
    buildAreaM2: number;
    totalM2: number;
    tsubo: number;
    score: PlanScore;
} {
    const { allRooms, W, D1, v, config, customWeights } = args;
    const buildAreaM2 = W * D1 * config.cellM2;
    const EXCLUDED_TYPES = new Set([
        'balcony',
        'porch',
        'deck',
        'void',
        'parking',
        'carport',
    ]);
    const totalM2 = allRooms.reduce(
        (s, r) => s + (EXCLUDED_TYPES.has(r.type) ? 0 : r.m2),
        0,
    );
    const tsubo = totalM2 / 3.3058;
    const cost = estimateCost(tsubo, v, config);
    const score = scorePlan(
        allRooms,
        totalM2,
        W,
        D1,
        v,
        cost,
        config,
        customWeights,
    );
    return { buildAreaM2, totalM2, tsubo, score };
}

export function createPlanSummary(args: {
    totalM2: number;
    tsubo: number;
    allRooms: readonly GridRoom[];
    buildAreaM2: number;
    v: PlanInput;
    unsatisfiedConstraints?: readonly string[] | undefined;
}): PlanSummary {
    const { totalM2, tsubo, allRooms, buildAreaM2, v, unsatisfiedConstraints } =
        args;
    const landM2 = v.landAreaTsubo * 3.305785;
    return {
        floorAreaM2: Math.round(totalM2 * 100) / 100,
        tsubo: Math.round(tsubo * 10) / 10,
        roomsList: allRooms.map((r) => r.name),
        coveragePercent: Math.round((buildAreaM2 / landM2) * 100 * 10) / 10,
        floorRatioPercent: Math.round((totalM2 / landM2) * 100 * 10) / 10,
        unsatisfiedConstraints,
    };
}
