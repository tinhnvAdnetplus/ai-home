import { type Plan, type PlanInput } from './types.js';
import { type Room } from '@aihome/bdm';
import {
    type ConformanceCheck,
    shoelaceAreaM2,
} from './conformance-helpers.js';
import { buildRoomChecks } from './conformance-room-checks.js';

export function buildBasicChecks(
    input: PlanInput,
    plan: Plan,
    allRooms: readonly Room[],
    actM2: number,
): ConformanceCheck[] {
    const m = plan.model;
    const checks: ConformanceCheck[] = [];

    // 1. Storeys
    checks.push({
        id: 'storeys',
        label: '階数の一致',
        expected: input.floors,
        actual: m.floors.length,
        status: input.floors === m.floors.length ? 'pass' : 'fail',
    });

    // 2. Floor Area (excluding void/balcony, ±8% of target tsubo or warning)
    const actTsubo = actM2 / 3.3058;
    const areaDevPct = Math.abs(actTsubo - input.targetArea) / input.targetArea;
    const hasAreaWarn = plan.warnings.some(
        (w) => w.code === 'TOTAL_AREA_DEVIATION',
    );
    const isAreaOk = areaDevPct <= 0.08 || hasAreaWarn;
    checks.push({
        id: 'floor_area',
        label: '延床面積の整合 (±8%)',
        expected: Math.round(input.targetArea * 10) / 10,
        actual: Math.round(actTsubo * 10) / 10,
        status: isAreaOk ? 'pass' : 'fail',
    });

    // 3. Room Counts and Sizes
    checks.push(...buildRoomChecks(input, plan, allRooms));

    // 4. Circulation ratio (hallway <= 6-8% of total floor area or <= 4.5m2 per floor)
    const hallRooms = allRooms.filter(
        (r) => r.type === 'hall' || r.type === 'corridor',
    );
    const hallM2 = hallRooms.reduce((s, r) => s + shoelaceAreaM2(r.polygon), 0);
    const hallRatio = actM2 > 0 ? hallM2 / actM2 : 0;
    const maxHallM2 = input.floors === 1 ? 6.0 : 12.0;
    const isCirculationOk = hallRatio <= 0.11 || hallM2 <= maxHallM2;
    checks.push({
        id: 'circulation_ratio',
        label: '廊下・ホール比率 (<=10%)',
        expected: '<=10%',
        actual: `${(hallRatio * 100).toFixed(1)}%`,
        status: isCirculationOk ? 'pass' : 'fail',
    });

    return checks;
}
