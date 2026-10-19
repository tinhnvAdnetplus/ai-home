import {
    type Exterior, type Parking, type ParkingKind, type Polygon, type Roof, type RoofKind, type SiteTree,
} from '@aihome/bdm';
import { type AiLayoutExterior, type AiLayoutWindow } from './ai-layout-schema.js';
import { type WindowSpec } from './openings.js';
import { type GridRoom, type PlanInput } from './types.js';

export function convertAiWindows(windows: readonly AiLayoutWindow[]): WindowSpec[] {
    return windows.map((w) => ({
        dir: w.dir, pos: w.pos, a: w.a, b: w.b, isBig: w.kind !== 'small', room: w.room, kind: w.kind,
    }));
}

function rectPolyMm(x0: number, y0: number, x1: number, y1: number): Polygon {
    return [
        { x: Math.round(x0), y: Math.round(y0) },
        { x: Math.round(x1), y: Math.round(y0) },
        { x: Math.round(x1), y: Math.round(y1) },
        { x: Math.round(x0), y: Math.round(y1) },
    ];
}

function defaultRoofForInput(v: PlanInput): RoofKind {
    if (v.roofType === '寄棟') return 'hipped';
    if (v.roofType === '片流れ') return 'shed';
    if (v.roofType === '陸屋根') return 'flat';
    return 'gabled';
}

function resolveParkingKind(parkingType?: string): ParkingKind {
    if (parkingType === 'ビルトイン') return 'garage';
    if (parkingType === 'カーポート') return 'carport';
    return 'surface';
}

export function resolveAiRoof(v: PlanInput, aiExt?: AiLayoutExterior): Roof {
    const kind = aiExt?.roofKind ?? defaultRoofForInput(v);
    const defaultPitch = kind === 'flat' ? 0 : kind === 'shed' ? 2.5 : kind === 'hipped' ? 3.5 : 4.0;
    const pitch = aiExt?.roofPitch ?? defaultPitch;
    const overhangMm = aiExt?.overhangMm ?? (kind === 'flat' ? 300 : kind === 'shed' ? 500 : 600);
    return { kind, pitch, overhangMm };
}

function buildParkingPoly(
    v: PlanInput,
    parkingKind: ParkingKind,
    houseWmm: number,
    frontageMm: number,
    depthMm: number,
    frontMm: number,
    entCenterXmm: number,
    aiExt?: AiLayoutExterior,
): Polygon | undefined {
    if (v.cars <= 0 || parkingKind === 'garage') return undefined;
    const rightSpaceMm = frontageMm - 500 - houseWmm;
    const isSide = v.parkingPlacement === 'side' || (frontMm < 2600 && rightSpaceMm >= 2300);
    if (isSide && rightSpaceMm >= 2300) {
        const maxSpaces = Math.max(1, Math.min(v.cars, Math.floor((rightSpaceMm - 100) / 2500)));
        const padW = Math.min(rightSpaceMm - 200, maxSpaces * 2500);
        const padD = Math.min(5000, depthMm - 200);
        return rectPolyMm(houseWmm + 150, -frontMm + 100, houseWmm + 150 + padW, -frontMm + 100 + padD);
    }
    if (frontMm < 1200) return undefined;
    const maxSpaces = Math.max(1, Math.min(v.cars, Math.floor((frontageMm - 600) / 2500)));
    const padW = maxSpaces * 2500;
    const padD = Math.min(5000, frontMm - 200);
    const isRight = aiExt?.parkingSide !== undefined ? aiExt.parkingSide === 'right' : entCenterXmm < houseWmm / 2;
    const x0 = isRight ? Math.max(-300, frontageMm - 700 - padW) : -300;
    return rectPolyMm(x0, -frontMm + 100, x0 + padW, -frontMm + 100 + padD);
}

function adjustTreeForDeck(t: SiteTree, deck: Polygon | undefined, maxY: number): SiteTree | null {
    if (!deck || deck.length === 0) return t;
    const xs = deck.map((p) => p.x);
    const ys = deck.map((p) => p.y);
    const overlapsX = t.pos.x + t.radiusMm > Math.min(...xs) && t.pos.x - t.radiusMm < Math.max(...xs);
    const deckMaxY = Math.max(...ys);
    if (!overlapsX || t.pos.y - t.radiusMm >= deckMaxY) return t;
    const shiftedY = deckMaxY + t.radiusMm + 150;
    return shiftedY + t.radiusMm <= maxY ? { pos: { x: t.pos.x, y: shiftedY }, radiusMm: t.radiusMm } : null;
}

export function assembleExteriorBdm(args: {
    readonly v: PlanInput;
    readonly W: number;
    readonly D1: number;
    readonly rooms1F: readonly GridRoom[];
    readonly gridMm: number;
    readonly frontageMm: number;
    readonly depthMm: number;
    readonly frontMm: number;
    readonly aiExt?: AiLayoutExterior | undefined;
}): { readonly roof: Roof; readonly parking: Parking; readonly exterior: Exterior } {
    const { v, W, D1, rooms1F, gridMm, frontageMm, depthMm, frontMm, aiExt } = args;
    const houseWmm = W * gridMm;
    const houseDmm = D1 * gridMm;
    const entryRc = rooms1F.find((r) => r.type === 'entrance')?.rects[0];
    const entCenterXmm = entryRc ? Math.round((entryRc.x + entryRc.w / 2) * gridMm) : Math.round(houseWmm / 4);
    const parkingKind = resolveParkingKind(v.parkingType);
    const parkingPolygon = buildParkingPoly(
        v, parkingKind, houseWmm, frontageMm, depthMm, frontMm, entCenterXmm, aiExt,
    );
    const approachPolygon =
        frontMm >= 800 ? rectPolyMm(entCenterXmm - 550, -frontMm, entCenterXmm + 550, 0) : undefined;

    let deckPolygon: Polygon | undefined;
    if (aiExt?.deck) {
        const dk = aiExt.deck;
        deckPolygon = rectPolyMm(dk.x * gridMm, dk.y * gridMm, (dk.x + dk.w) * gridMm, (dk.y + dk.h) * gridMm);
    } else if (v.outdoorOpts?.includes('ウッドデッキ')) {
        const rc = rooms1F.find((r) => r.type === 'ldk')?.rects[0];
        const rearSpaceMm = depthMm - frontMm - houseDmm;
        if (rc && rearSpaceMm >= 1200) {
            const deckD = Math.min(1820, rearSpaceMm - 300);
            const deckW = Math.min(rc.w * gridMm, 3640);
            deckPolygon = rectPolyMm(rc.x * gridMm, houseDmm, rc.x * gridMm + deckW, houseDmm + deckD);
        }
    }

    const maxY = depthMm - frontMm;
    const rawTrees: SiteTree[] =
        aiExt?.trees && aiExt.trees.length > 0
            ? aiExt.trees.map((t) => ({ pos: { x: Math.round(t.x * gridMm), y: Math.round(t.y * gridMm) }, radiusMm: 850 }))
            : maxY - houseDmm >= 1400
              ? [
                    { pos: { x: Math.min(frontageMm - 1400, houseWmm - 600), y: houseDmm + 900 }, radiusMm: 850 },
                    { pos: { x: 600, y: houseDmm + 850 }, radiusMm: 750 },
                ]
              : [];
    const trees = rawTrees
        .map((t) => adjustTreeForDeck(t, deckPolygon, maxY))
        .filter((t): t is SiteTree => t !== null);

    return {
        roof: resolveAiRoof(v, aiExt),
        parking: { spaces: v.cars, kind: parkingKind, polygon: parkingPolygon },
        exterior: {
            wallColor: aiExt?.wallColor,
            roofColor: aiExt?.roofColor,
            accentColor: aiExt?.accentColor,
            hasEntranceLattice: aiExt?.hasEntranceLattice,
            deckPolygon,
            approachPolygon,
            trees,
        },
    };
}
