import { type PlanInput, type Plan } from './types.js';
import { type PlannerConfig } from './config.js';
import { convertToBdm } from './to-bdm.js';
import { type VariantDefinition } from './variants.js';
import { buildProgram } from './rooms.js';
import { assembleBands } from './zoning.js';
import { mirrorFloorRooms } from './floor-builder.js';
import { shouldMirrorForSun } from './sun-side.js';
import {
    pickSiteFit,
    preSizeFootprint,
    resolveDimensionsOnSite,
} from './site-fit.js';
import { collectVariantWarnings } from './variant-warnings.js';
import {
    buildVariantFloorData,
    calcVariantAreasAndScore,
    createPlanSummary,
} from './variant-floors.js';

export function generateVariantPlan(
    v0: PlanInput,
    variant: VariantDefinition,
    config: PlannerConfig,
    seed: number,
    customWeights?: {
        housework: number;
        storage: number;
        daylight: number;
        budget: number;
    },
    appliedConstraints?: readonly string[],
    unsatisfiedConstraints?: readonly string[],
): Plan {
    const v = variant.adjust(v0);
    const prog = buildProgram(v);
    if (variant.isLdkFirst) {
        for (const band of prog.f1) {
            if (band.isLdk) {
                band.items.sort(
                    (a, b) => Number(b.tag === 'LDK') - Number(a.tag === 'LDK'),
                );
            }
        }
    }
    const preSized = preSizeFootprint(v, prog, variant, config);

    const bandW = Math.max(6, preSized.W);
    const report = { isSplit: false };

    prog.f1 = assembleBands(
        prog.f1,
        bandW,
        variant.isEntryFirst ?? false,
        report,
    );
    if (prog.f2)
        prog.f2 = assembleBands(
            prog.f2,
            bandW,
            variant.isEntryFirst ?? false,
            report,
        );

    const dims = resolveDimensionsOnSite(prog, variant, v, config);
    const { W, D1, D2, f1, f2, droppedItems } = dims;
    // where the cars went and which setbacks were used shape the site boundary and the checks from here on
    const placed = { ...v, ...pickSiteFit(dims) };

    const floors = f2 ? [f1, f2] : [f1];
    if (shouldMirrorForSun(variant.isMirror, v.roadSide, f1.rooms, W, D1)) {
        for (const fl of floors) mirrorFloorRooms(fl.rooms, W);
    }

    const { floorData, allRooms, isolatedRooms } = buildVariantFloorData(
        floors,
        W,
    );

    const { buildAreaM2, totalM2, tsubo, score } = calcVariantAreasAndScore({
        allRooms,
        W,
        D1,
        v: placed,
        config,
        customWeights,
    });

    const ldkRoom = f1.rooms.find((x) => x.key === 'ldk');
    const masterRoom = allRooms.find((x) => x.type === 'bedroom');
    const childRooms = allRooms.filter((x) => x.type === 'childRoom');
    const actualKidsJo =
        childRooms.length > 0
            ? childRooms.reduce((s, r) => s + r.jo, 0) / childRooms.length
            : 0;

    const warnings = collectVariantWarnings({
        progWarnings: prog.warnings,
        buildAreaM2,
        totalM2,
        tsubo,
        v: placed,
        v0,
        config,
        W,
        D1,
        D2,
        hasSecondFloor: f2 !== null,
        ldkRoom,
        masterRoom,
        actualKidsJo,
        isolatedRooms,
        droppedItems,
        unsatisfiedConstraints,
    });

    const bdm = convertToBdm(
        placed,
        W,
        floorData,
        config.gridMm,
        seed,
        warnings,
    );

    const summary = createPlanSummary({
        totalM2,
        tsubo,
        allRooms,
        buildAreaM2,
        v: placed,
        unsatisfiedConstraints,
    });

    return {
        id: `plan-${variant.id.toLowerCase()}`,
        label: variant.name,
        score,
        model: bdm,
        summary,
        warnings,
        appliedConstraints,
    };
}
