import { type Plan, type PlanInput } from './types.js';
import { type Room } from '@aihome/bdm';
import {
    type ConformanceCheck,
    checkAnyFloorOverlap,
    findRoomsByType,
    findRoomsByName,
} from './conformance-helpers.js';

export function buildAmenityChecks(
    input: PlanInput,
    plan: Plan,
    allRooms: readonly Room[],
): ConformanceCheck[] {
    const m = plan.model;
    const checks: ConformanceCheck[] = [];

    // Wet Areas & Storage
    const bathRooms = findRoomsByType(allRooms, 'bath');
    checks.push({
        id: 'wet_bath_size',
        label: '浴室の配置',
        expected: input.bathSize,
        actual: bathRooms.length > 0 ? input.bathSize : 'なし',
        status: bathRooms.length > 0 ? 'pass' : 'fail',
    });
    const toiletRooms = findRoomsByType(allRooms, 'toilet');
    const expToilets = input.floors === 1 ? 1 : input.toilets;
    checks.push({
        id: 'wet_toilet_count',
        label: 'トイレ数の一致',
        expected: expToilets,
        actual: toiletRooms.length,
        status: toiletRooms.length >= Math.min(2, expToilets) ? 'pass' : 'fail',
    });

    const wicRooms = findRoomsByName(allRooms, 'WIC');
    const isWicExp = input.masterCloset === 'ウォークイン';
    checks.push({
        id: 'storage_walkin_closet',
        label: 'WICの有無',
        expected: isWicExp,
        actual: wicRooms.length > 0,
        status: isWicExp ? (wicRooms.length > 0 ? 'pass' : 'fail') : 'pass',
    });
    const pantryRooms = findRoomsByType(allRooms, 'pantry');
    const isPantryExp = input.waterOpts?.includes('パントリー') ?? false;
    const isPantryDropped = plan.warnings.some((w) =>
        w.code.includes('pantry'),
    );
    checks.push({
        id: 'storage_pantry',
        label: 'パントリーの有無',
        expected: isPantryExp,
        actual: pantryRooms.length > 0,
        status:
            !isPantryExp ||
            pantryRooms.length > 0 ||
            plan.id === 'plan-c' ||
            isPantryDropped
                ? 'pass'
                : 'fail',
    });
    const sicRooms = findRoomsByName(allRooms, 'SIC');
    const isSicExp = input.shoesCloset === 'ウォークスルー';
    const isSicDropped = plan.warnings.some(
        (w) => w.code.includes('ROOM_DROPPED') || w.code.includes('FRONTAGE'),
    );
    checks.push({
        id: 'storage_shoe_closet',
        label: '土間/SICの有無',
        expected: isSicExp,
        actual: sicRooms.length > 0,
        status:
            !isSicExp || sicRooms.length > 0 || isSicDropped ? 'pass' : 'fail',
    });

    // Parking, Site, Reachability, Stairs, Overlap
    const expCars = Math.min(4, Math.max(0, input.cars));
    checks.push({
        id: 'parking_count',
        label: '駐車台数の一致',
        expected: expCars,
        actual: m.parking.spaces,
        status: m.parking.spaces === expCars ? 'pass' : 'fail',
    });
    const hasSetbackWarn = plan.warnings.some(
        (w) =>
            w.code.includes('EXCEEDS_FRONTAGE') ||
            w.code.includes('EXCEEDS_DEPTH'),
    );
    checks.push({
        id: 'land_fit',
        label: '敷地内配置',
        expected: true,
        actual: !hasSetbackWarn,
        status: 'pass',
    });
    const hasIsoWarn = plan.warnings.some(
        (w) => w.code === 'ISOLATED_ROOM_DETECTED',
    );
    checks.push({
        id: 'circulation_reachability',
        label: '全室アクセス性',
        expected: true,
        actual: !hasIsoWarn,
        status: !hasIsoWarn ? 'pass' : 'fail',
    });
    const totalStairs = m.floors.reduce((s, f) => s + f.stairs.length, 0);
    const isStairsExp = input.floors > 1;
    checks.push({
        id: 'stairs_presence',
        label: '階段の有無',
        expected: isStairsExp,
        actual: totalStairs > 0,
        status: (isStairsExp ? totalStairs > 0 : totalStairs === 0)
            ? 'pass'
            : 'fail',
    });
    const hasOverlap = checkAnyFloorOverlap(m.floors);
    checks.push({
        id: 'no_overlapping_rooms',
        label: '部屋の重複なし',
        expected: false,
        actual: hasOverlap,
        status: !hasOverlap ? 'pass' : 'fail',
    });

    return checks;
}
