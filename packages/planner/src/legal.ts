import { type BdmIssue } from '@aihome/bdm';

export type LegalCheckInput = {
    readonly buildAreaM2: number;
    readonly totalM2: number;
    readonly landAreaM2: number;
    readonly coverageLimit: number;
    readonly floorRatioLimit: number;
    readonly buildingWidthM: number;
    readonly buildingDepthM: number;
    readonly frontageM: number;
    /** depth (m) the house may take after the front distance and the rear setback */
    readonly buildableDepthM: number;
    readonly targetTsubo: number;
    readonly actualTsubo: number;
    readonly desiredLdkJo: number;
    readonly actualLdkJo: number;
    readonly desiredMasterJo?: number | undefined;
    readonly actualMasterJo?: number | undefined;
    readonly desiredKidsJo?: number | undefined;
    readonly actualKidsJo?: number | undefined;
    readonly isolatedRooms: readonly string[];
    readonly hasSecondFloorSetback: boolean;
    readonly secondFloorSetbackM: number;
};

export function performLegalChecks(
    input: LegalCheckInput,
): readonly BdmIssue[] {
    const issues: BdmIssue[] = [];

    const covActual = (input.buildAreaM2 / input.landAreaM2) * 100;
    const farActual = (input.totalM2 / input.landAreaM2) * 100;

    const isCoverageOk = covActual <= input.coverageLimit + 0.5;
    const isFarOk = farActual <= input.floorRatioLimit + 0.5;
    const isWidthOk = input.buildingWidthM <= input.frontageM - 1.0 + 0.01;
    const isDepthOk = input.buildingDepthM <= input.buildableDepthM + 0.01;

    if (!isCoverageOk) {
        issues.push({
            path: ['legal', 'coverage'],
            code: 'COVERAGE_RATIO_EXCEEDED',
            message: `建築面積 ${covActual.toFixed(1)}% が建ぺい率の上限（${input.coverageLimit.toString()}%）を超えています。`,
            level: 'warn',
        });
    }

    if (!isFarOk) {
        issues.push({
            path: ['legal', 'floorRatio'],
            code: 'FLOOR_AREA_RATIO_EXCEEDED',
            message: `延床面積 ${farActual.toFixed(1)}% が容積率の上限（${input.floorRatioLimit.toString()}%）を超えています。`,
            level: 'warn',
        });
    }

    if (!isWidthOk || !isDepthOk) {
        issues.push({
            path: ['legal', 'dimensions'],
            code: !isWidthOk
                ? 'BUILDING_EXCEEDS_FRONTAGE'
                : 'BUILDING_EXCEEDS_DEPTH',
            message: `建物の外形（${input.buildingWidthM.toFixed(2)}m × ${input.buildingDepthM.toFixed(2)}m）が敷地寸法に収まりません。`,
            level: 'warn',
        });
    }

    if (input.hasSecondFloorSetback) {
        issues.push({
            path: ['floors', 1],
            code: 'SECOND_FLOOR_SETBACK_INFO',
            message: `2階を1階より${input.secondFloorSetbackM.toFixed(2)}m浅くし、残りを下屋としています。`,
            level: 'info',
        });
    }

    if (input.isolatedRooms.length > 0) {
        issues.push({
            path: ['circulation'],
            code: 'ISOLATED_ROOM_DETECTED',
            message: `「${input.isolatedRooms.join('・')}」は動線の再検討項目として記録しました。`,
            level: 'info',
        });
    }

    const areaDevPct =
        (Math.abs(input.actualTsubo - input.targetTsubo) / input.targetTsubo) *
        100;
    if (areaDevPct >= 7.5) {
        issues.push({
            path: ['summary', 'tsubo'],
            code: 'TOTAL_AREA_DEVIATION',
            message: `ご希望の延床面積 ${input.targetTsubo.toFixed(1)} 坪に対し、算出面積は約 ${input.actualTsubo.toFixed(1)} 坪です（乖離 ${areaDevPct.toFixed(1)}%）。`,
            level: 'warn',
        });
    }

    if (input.actualLdkJo < input.desiredLdkJo - 1) {
        issues.push({
            path: ['rooms', 'ldk'],
            code: 'ROOM_SIZE_REDUCED:ldk',
            message: `この案のLDKは ${(Math.round(input.actualLdkJo * 10) / 10).toString()} 帖です（ご希望 ${input.desiredLdkJo.toString()} 帖）。`,
            level: 'warn',
        });
    }

    if (
        input.desiredLdkJo > 0 &&
        input.actualLdkJo > input.desiredLdkJo * 1.5
    ) {
        issues.push({
            path: ['rooms', 'ldk'],
            code: 'ROOM_OVERSIZED:ldk',
            message: `LDKの面積（${input.actualLdkJo.toFixed(1)} 帖）がご希望（${input.desiredLdkJo.toString()} 帖）の1.5倍を超えています。`,
            level: 'warn',
        });
    }

    if (
        input.desiredMasterJo !== undefined &&
        input.actualMasterJo !== undefined &&
        input.actualMasterJo < input.desiredMasterJo - 1
    ) {
        issues.push({
            path: ['rooms', 'master'],
            code: 'ROOM_SIZE_REDUCED:master',
            message: `この案の主寝室は ${(Math.round(input.actualMasterJo * 10) / 10).toString()} 帖です（ご希望 ${input.desiredMasterJo.toString()} 帖）。`,
            level: 'warn',
        });
    }

    if (
        input.desiredKidsJo !== undefined &&
        input.actualKidsJo !== undefined &&
        input.actualKidsJo > 0 &&
        input.actualKidsJo < input.desiredKidsJo - 1
    ) {
        issues.push({
            path: ['rooms', 'kids'],
            code: 'ROOM_SIZE_REDUCED:kids',
            message: `この案の子ども部屋は ${(Math.round(input.actualKidsJo * 10) / 10).toString()} 帖です（ご希望 ${input.desiredKidsJo.toString()} 帖）。`,
            level: 'warn',
        });
    }

    return issues;
}
