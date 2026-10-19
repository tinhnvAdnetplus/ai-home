import { type Fixture } from '@aihome/bdm';
import { type Plan, type PlanInput, type GridRoom } from './types.js';
import { type PlannerConfig } from './config.js';
import { type VariantDefinition } from './variants.js';
import { type AiLayout } from './ai-layout-schema.js';
import { convertToBdm } from './to-bdm.js';
import { measureRoom } from './grid.js';
import { collectVariantWarnings } from './variant-warnings.js';
import {
    buildVariantFloorData,
    calcVariantAreasAndScore,
    createPlanSummary,
} from './variant-floors.js';
import { validateLayout } from './plan-validator.js';
import { convertAiDoors } from './ai-layout-doors-convert.js';
import { convertAiFixtures } from './ai-layout-fixtures-convert.js';
import { convertAiWindows } from './ai-layout-exterior-convert.js';

/** Turn an AI room layout into a full plan: doors, furniture, exterior windows, roof, and site
 * landscaping come from the AI's own output when supplied, falling back to rule-based generators
 * otherwise (e.g. the internal lot-first solver). */
export function planFromAiLayout(
    input: PlanInput,
    layout: AiLayout,
    variant: VariantDefinition,
    config: PlannerConfig,
    seed: number,
): Plan {
    const floors = layout.floors.map((fl) => {
        const name = `${fl.level.toString()}F`;
        const rooms: GridRoom[] = fl.rooms.map((r, i) =>
            measureRoom(
                {
                    id: `${name}-${r.key}-${i.toString()}`,
                    key: r.key,
                    name: r.name,
                    type: r.type,
                    rects: r.rects.map((rc) => ({ ...rc })),
                    cells: 0,
                    m2: 0,
                    jo: 0,
                },
                config.cellM2,
            ),
        );
        const doorsOverride = fl.doors
            ? convertAiDoors(fl.rooms, fl.doors)
            : undefined;
        const fixturesOverride: readonly Fixture[] | undefined = fl.fixtures
            ? convertAiFixtures(fl.level, fl.fixtures, config.gridMm)
            : undefined;
        const windowsOverride = fl.windows
            ? convertAiWindows(fl.windows)
            : undefined;
        return {
            name,
            gridD: fl.gridD,
            rooms,
            doorsOverride,
            fixturesOverride,
            windowsOverride,
        };
    });
    const W = layout.gridW;
    const D1 = floors[0]?.gridD ?? 0;
    const D2 = floors[1]?.gridD ?? 0;
    const { floorData, allRooms, isolatedRooms } = buildVariantFloorData(
        floors,
        W,
    );
    const { buildAreaM2, totalM2, tsubo, score } = calcVariantAreasAndScore({
        allRooms,
        W,
        D1,
        v: input,
        config,
    });
    const children = allRooms.filter((r) => r.type === 'childRoom');
    const warnings = collectVariantWarnings({
        buildAreaM2,
        totalM2,
        tsubo,
        v: input,
        v0: input,
        config,
        W,
        D1,
        D2,
        hasSecondFloor: floors.length === 2,
        ldkRoom: allRooms.find((r) => r.type === 'ldk'),
        masterRoom: allRooms.find((r) => r.type === 'bedroom'),
        actualKidsJo:
            children.length > 0
                ? children.reduce((s, r) => s + r.jo, 0) / children.length
                : 0,
        isolatedRooms,
        droppedItems: [],
    });
    const model = convertToBdm(
        input,
        W,
        floorData,
        config.gridMm,
        seed,
        warnings,
        layout.exterior,
    );
    const summary = createPlanSummary({
        totalM2,
        tsubo,
        allRooms,
        buildAreaM2,
        v: input,
    });
    return {
        id: `plan-${variant.id.toLowerCase()}`,
        label: variant.name,
        score,
        model,
        summary,
        warnings: [...warnings, ...validateLayout(model)],
        source: 'ai',
    };
}

