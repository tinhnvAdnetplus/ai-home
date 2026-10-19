import {
    generatePlansSafe,
    mapAnswersToPlanInput,
    type Plan,
} from '../src/index.js';
import { type BuildingModel, type Room } from '@aihome/bdm';
import { DEFAULT_ANSWERS } from './sweep-generator.js';

export const JO_M2 = 1.62;
export const TSUBO_M2 = 3.3058;

const EXCLUDED_ROOM_TYPES = new Set([
    'balcony',
    'porch',
    'deck',
    'void',
    'parking',
    'carport',
]);

export function shoelaceAreaM2(
    points: readonly { readonly x: number; readonly y: number }[],
): number {
    const n = points.length;
    if (n < 3) return 0;
    let sum = 0;
    for (let i = 0; i < n; i++) {
        const curr = points[i];
        const next = points[(i + 1) % n];
        if (curr && next) {
            sum += curr.x * next.y - next.x * curr.y;
        }
    }
    return Math.abs(sum) / 2 / 1_000_000;
}

export type OracleMetrics = {
    readonly storeys: number;
    readonly totalFloorAreaM2: number;
    readonly totalFloorAreaTsubo: number;
    readonly stairsCount: number;
    readonly roomCounts: Readonly<Record<string, number>>;
    readonly roomAreasM2: Readonly<Record<string, number>>;
    readonly roomAreasJo: Readonly<Record<string, number>>;
    readonly allRooms: readonly {
        readonly id: string;
        readonly name: string;
        readonly type: string;
        readonly areaM2: number;
        readonly jo: number;
    }[];
};

export function measureModelWithOracle(model: BuildingModel): OracleMetrics {
    const storeys = model.floors.length;
    let totalM2 = 0;
    let stairsCount = 0;
    const roomCounts: Record<string, number> = {};
    const roomAreasM2: Record<string, number> = {};
    const roomAreasJo: Record<string, number> = {};
    const allRooms: {
        id: string;
        name: string;
        type: string;
        areaM2: number;
        jo: number;
    }[] = [];

    for (const floor of model.floors) {
        stairsCount += floor.stairs.length;
        for (const room of floor.rooms) {
            const areaM2 = shoelaceAreaM2(room.polygon);
            const jo = areaM2 / JO_M2;
            allRooms.push({
                id: room.id,
                name: room.name,
                type: room.type,
                areaM2,
                jo,
            });

            if (!EXCLUDED_ROOM_TYPES.has(room.type)) {
                totalM2 += areaM2;
            }

            roomCounts[room.type] = (roomCounts[room.type] ?? 0) + 1;
            roomAreasM2[room.type] = (roomAreasM2[room.type] ?? 0) + areaM2;
            roomAreasJo[room.type] = (roomAreasJo[room.type] ?? 0) + jo;
        }
    }

    return {
        storeys,
        totalFloorAreaM2: totalM2,
        totalFloorAreaTsubo: totalM2 / TSUBO_M2,
        stairsCount,
        roomCounts,
        roomAreasM2,
        roomAreasJo,
        allRooms,
    };
}

export function evaluatePlanWithOracle(
    answers: Record<string, unknown>,
    plan: Plan,
): {
    readonly metrics: OracleMetrics;
    readonly requested: {
        readonly targetTsubo: number;
        readonly floors: number;
        readonly ldkJo: number;
        readonly masterJo: number;
        readonly kidsRooms: number;
        readonly kidsJo: number;
    };
} {
    const { input } = mapAnswersToPlanInput(answers);
    const metrics = measureModelWithOracle(plan.model);
    return {
        metrics,
        requested: {
            targetTsubo: input.targetArea,
            floors: input.floors,
            ldkJo: input.ldkSize,
            masterJo: input.masterSize,
            kidsRooms: input.kidsRooms,
            kidsJo: input.kidsSize,
        },
    };
}
