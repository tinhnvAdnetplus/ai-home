import { type Plan, mapAnswersToPlanInput } from '@aihome/planner';
import {
    computeModelTotalAreaTsubo,
    computeLdkJo,
    computeBedroomCount,
    computeBathSizeLabel,
    computeStorageCount,
} from './plan-metrics';

import type {
    ComparisonLabelKey,
    ComparisonRow,
} from './plan-comparison-types';

export type { ComparisonLabelKey, ComparisonRow };

function findWarning(
    warnings: Plan['warnings'],
    keyword: string,
): string | undefined {
    return warnings.find((w) =>
        w.code.toUpperCase().includes(keyword.toUpperCase()),
    )?.message;
}

export function buildPlanComparison(
    answers: Record<string, unknown>,
    plan: Plan,
): readonly ComparisonRow[] {
    const { input } = mapAnswersToPlanInput(answers);
    const m = plan.model;

    const actualTsubo = computeModelTotalAreaTsubo(m);
    const areaRatio =
        (actualTsubo - input.targetArea) / (input.targetArea || 1);
    const isAreaOk = Math.abs(areaRatio) <= 0.08;
    const areaDiffPct = Math.round(areaRatio * 100);
    const areaDiffStr =
        areaDiffPct >= 0
            ? `+${areaDiffPct.toString()}%`
            : `${areaDiffPct.toString()}%`;

    const actualFloors = m.floors.length;
    const isFloorsOk = actualFloors === input.floors;
    const diffFloors = actualFloors - input.floors;

    const actualLdk = computeLdkJo(m);
    const isLdkOk = Math.abs(actualLdk - input.ldkSize) <= 1.0;
    const ldkDiff = Math.round((actualLdk - input.ldkSize) * 10) / 10;
    const ldkDiffStr =
        ldkDiff >= 0 ? `+${ldkDiff.toString()}帖` : `${ldkDiff.toString()}帖`;

    const expBedrooms = 1 + input.kidsRooms;
    const actualBedrooms = computeBedroomCount(m);
    const isBedroomsOk = actualBedrooms === expBedrooms;
    const bedDiff = actualBedrooms - expBedrooms;
    const bedDiffStr =
        bedDiff >= 0
            ? `+${bedDiff.toString()}部屋`
            : `${bedDiff.toString()}部屋`;

    const actualParking = m.parking.spaces;
    const isParkingOk = actualParking === input.cars;
    const parkDiff = actualParking - input.cars;
    const parkDiffStr =
        parkDiff >= 0
            ? `+${parkDiff.toString()}台`
            : `${parkDiff.toString()}台`;

    const actualBath = computeBathSizeLabel(m);
    const isBathOk = actualBath === input.bathSize;

    const actualStorage = computeStorageCount(m);
    const isStorageOk = actualStorage >= 2;

    return [
        {
            id: 'area',
            labelKey: 'plan:comparisonTotalArea',
            wishValue: `${input.targetArea.toString()}坪`,
            resultValue: `${actualTsubo.toString()}坪`,
            isMatch: isAreaOk,
            diffText: areaDiffStr,
            warningText: isAreaOk
                ? undefined
                : findWarning(plan.warnings, 'AREA'),
        },
        {
            id: 'floors',
            labelKey: 'plan:comparisonFloors',
            wishValue: `${input.floors.toString()}階`,
            resultValue: `${actualFloors.toString()}階`,
            isMatch: isFloorsOk,
            diffText:
                diffFloors !== 0
                    ? diffFloors > 0
                        ? `+${diffFloors.toString()}階`
                        : `${diffFloors.toString()}階`
                    : undefined,
            warningText: isFloorsOk
                ? undefined
                : findWarning(plan.warnings, 'FLOOR'),
        },
        {
            id: 'ldk',
            labelKey: 'plan:comparisonLdk',
            wishValue: `${input.ldkSize.toString()}帖`,
            resultValue: `${actualLdk.toString()}帖`,
            isMatch: isLdkOk,
            diffText: ldkDiffStr,
            warningText: isLdkOk
                ? undefined
                : findWarning(plan.warnings, 'LDK'),
        },
        {
            id: 'bedrooms',
            labelKey: 'plan:comparisonBedrooms',
            wishValue: `${expBedrooms.toString()}部屋`,
            resultValue: `${actualBedrooms.toString()}部屋`,
            isMatch: isBedroomsOk,
            diffText: bedDiffStr,
            warningText: isBedroomsOk
                ? undefined
                : findWarning(plan.warnings, 'ROOM'),
        },
        {
            id: 'parking',
            labelKey: 'plan:comparisonParking',
            wishValue: `${input.cars.toString()}台`,
            resultValue: `${actualParking.toString()}台`,
            isMatch: isParkingOk,
            diffText: parkDiffStr,
            warningText: isParkingOk
                ? undefined
                : findWarning(plan.warnings, 'PARKING'),
        },
        {
            id: 'bath',
            labelKey: 'plan:comparisonBath',
            wishValue: input.bathSize,
            resultValue: actualBath,
            isMatch: isBathOk,
            diffText: isBathOk ? undefined : actualBath,
            warningText: isBathOk
                ? undefined
                : findWarning(plan.warnings, 'BATH'),
        },
        {
            id: 'storage',
            labelKey: 'plan:comparisonStorage',
            wishValue: input.storageLevel ?? '標準',
            resultValue: `${actualStorage.toString()}箇所`,
            isMatch: isStorageOk,
            warningText: isStorageOk
                ? undefined
                : findWarning(plan.warnings, 'STORAGE'),
        },
    ];
}
