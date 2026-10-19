import { type PlanInput } from './types.js';
import { type VariantDefinition } from './variants.js';
import { frontYardM } from './site-layout.js';
import { layoutLimits } from './ai-layout-check.js';
import { sunEdge } from './sun-side.js';
import { createPrng } from './prng.js';

/**
 * Neutral design angles the AI can be nudged toward. Kept deliberately broader than the 3
 * fixed rule-based variant descriptions so repeated generations do not always land on the same
 * 3 strategies (家事動線重視／開放感重視／コスト重視) — see `pickLayoutFocus`.
 */
const LAYOUT_FOCUS_POOL: readonly string[] = [
    '開放的なワンルームLDKと庭とのつながりを重視',
    '家族それぞれの個室の独立性・静けさを重視',
    '建築コストと施工効率を抑えたコンパクトな外形を重視',
    '和の要素（和室・縁側・格子など）を取り入れた伝統的な間取り',
    '水まわりと収納を一直線に並べた家事動線重視',
    'バリアフリー・将来の1階生活を見据えた平屋的な動線',
    'ペットと暮らす家族のための回遊動線と土間空間',
    '在宅ワークを快適にする独立した書斎・ワークスペース',
    '大容量収納（ファミリークローゼット・パントリー）を重視',
    '左右対称でフォーマルな外観とゆとりある玄関まわり',
];

/** Deterministic per-seed pick so the same seed always designs the same angle (testable), while
 * different seeds (one per variant/regeneration) spread across the pool instead of 3 fixed ones. */
export function pickLayoutFocus(seed: number): string {
    const rand = createPrng(seed);
    const i = Math.floor(rand() * LAYOUT_FOCUS_POOL.length);
    return LAYOUT_FOCUS_POOL[i] ?? LAYOUT_FOCUS_POOL[0] ?? '';
}

/** The facts the AI needs to design one variant (sent as the user message). */
export function buildAiLayoutContext(
    input: PlanInput,
    variant: VariantDefinition,
    seed: number,
): Record<string, unknown> {
    const { maxW, maxD } = layoutLimits(input);
    return {
        variant: {
            id: variant.id,
            name: variant.name,
            focus: pickLayoutFocus(seed),
        },
        lot: {
            frontageM: input.frontage,
            depthM: input.landDepth,
            areaTsubo: input.landAreaTsubo,
            roadSide: input.roadSide,
            sunEdge: sunEdge(input.roadSide),
            maxGridW: maxW,
            maxGridD: maxD,
            frontYardM: frontYardM(input),
            coverageLimitPercent: input.coverageLimit ?? 60,
            floorRatioLimitPercent: input.floorRatioLimit ?? 200,
        },
        floors: input.floors,
        targetTsubo: input.targetArea,
        program: {
            ldkJo: input.ldkSize,
            masterBedroomJo: input.masterSize,
            childRooms: { count: input.kidsRooms, jo: input.kidsSize },
            toilets: input.toilets,
            bath: { size: input.bathSize, floor: input.bathFloor },
            washBasins: input.washCount,
            wetOptions: input.waterOpts ?? [],
            tatamiRoom: input.tatamiRoom ?? 'なし',
            shoesCloset: input.shoesCloset ?? 'なし',
            masterCloset: input.masterCloset ?? 'ウォークイン',
            storageOptions: input.storageOpts ?? [],
            extraRooms: input.extraRooms ?? [],
            outdoor: input.outdoorOpts ?? [],
            kitchenType: input.kitchenType ?? '',
            workFromHome: input.wfh ?? '',
            mustHave: input.mustHave ?? [],
            notNeeded: input.notNeeded ?? [],
            priorities: input.priorities ?? [],
        },
        parking: { cars: input.cars, type: input.parkingType ?? '' },
        exteriorPreference: {
            style: input.exteriorStyle ?? 'モダン',
            interiorStyle: input.interiorStyle ?? '木目ナチュラル',
            roofType: input.roofType ?? '',
            outdoor: input.outdoorOpts ?? [],
        },
    };
}

