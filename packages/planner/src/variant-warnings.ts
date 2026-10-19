import { buildableDepthM } from './site-layout.js';
import { type BdmIssue } from '@aihome/bdm';
import { type PlanInput, type GridRoom } from './types.js';
import { type PlannerConfig } from './config.js';
import { performLegalChecks } from './legal.js';
import { rectsTouchSun } from './sun-side.js';

export function collectVariantWarnings(args: {
    progWarnings?: readonly BdmIssue[] | undefined;
    buildAreaM2: number;
    totalM2: number;
    tsubo: number;
    v: PlanInput;
    v0: PlanInput;
    config: PlannerConfig;
    W: number;
    D1: number;
    D2: number;
    hasSecondFloor: boolean;
    ldkRoom?: GridRoom | undefined;
    masterRoom?: GridRoom | undefined;
    actualKidsJo: number;
    isolatedRooms: readonly string[];
    droppedItems: readonly string[];
    unsatisfiedConstraints?: readonly string[] | undefined;
}): BdmIssue[] {
    const {
        progWarnings,
        buildAreaM2,
        totalM2,
        tsubo,
        v,
        v0,
        config,
        W,
        D1,
        D2,
        hasSecondFloor,
        ldkRoom,
        masterRoom,
        actualKidsJo,
        isolatedRooms,
        droppedItems,
        unsatisfiedConstraints,
    } = args;

    const warnings: BdmIssue[] = [
        ...(progWarnings ?? []),
        ...performLegalChecks({
            buildAreaM2,
            totalM2,
            landAreaM2: v.landAreaTsubo * 3.305785,
            coverageLimit: v.coverageLimit ?? config.defaultCoverageLimit,
            floorRatioLimit: v.floorRatioLimit ?? config.defaultFloorRatioLimit,
            buildingWidthM: W * 0.91,
            buildingDepthM: D1 * 0.91,
            frontageM: v.frontage,
            buildableDepthM: buildableDepthM(v),
            targetTsubo: v0.targetArea,
            actualTsubo: tsubo,
            desiredLdkJo: v0.ldkSize,
            actualLdkJo: ldkRoom?.jo ?? 0,
            desiredMasterJo: v0.masterSize,
            actualMasterJo: masterRoom?.jo,
            desiredKidsJo: v0.kidsRooms > 0 ? v0.kidsSize : undefined,
            actualKidsJo,
            isolatedRooms,
            hasSecondFloorSetback: hasSecondFloor && D2 < D1,
            secondFloorSetbackM: (D1 - D2) * 0.91,
        }),
    ];

    for (const tag of droppedItems) {
        warnings.push({
            path: ['rooms'],
            code: 'ROOM_DROPPED_DUE_TO_FRONTAGE',
            message: `敷地間口の制約により「${tag}」を省略しました。`,
            level: 'info',
        });
    }
    // stalls are 2.5 m wide and side by side across the front yard (same rule as the 3D site)
    const fitCars = Math.floor((v.frontage + 0.2) / 2.5);
    if (v.parkingType !== 'ビルトイン' && v.cars > fitCars) {
        warnings.push({
            path: ['parking'],
            code: 'PARKING_TOO_NARROW',
            message: `間口${v.frontage.toString()}mでは並列駐車は${fitCars.toString()}台までです（希望${v.cars.toString()}台）。縦列駐車や台数をご確認ください。`,
            level: 'warn',
        });
    }

    if (ldkRoom && !rectsTouchSun(ldkRoom.rects, v.roadSide, W, D1)) {
        warnings.push({
            path: ['rooms', 'ldk'],
            code: 'LDK_NOT_SUN_SIDE',
            message: `LDKが日当たりの良い南側の外壁に面していません（${v.roadSide}道路）。採光をご確認ください。`,
            level: 'warn',
        });
    }

    for (const u of unsatisfiedConstraints ?? []) {
        warnings.push({
            path: ['constraints'],
            code: 'CONSTRAINT_UNSATISFIED',
            message: `制約条件「${u}」を満たすことができませんでした。`,
            level: 'info',
        });
    }

    return warnings;
}
