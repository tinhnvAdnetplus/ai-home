import { type SiteTree, EXTERIOR_WALL_THICKNESS_MM } from '@aihome/bdm';

/** Clear gap between a tree canopy and the outer face of the building's walls. */
export const TREE_WALL_CLEARANCE_MM = 150;

/**
 * Same convention as `adjustTreeForDeck`: a tree whose canopy circle would reach into the
 * ground-floor walls is pushed straight out from the face it is nearest to (keeping its other
 * coordinate), or dropped when the lot has no room for it there. A tree whose centre lies inside
 * the footprint is always dropped — there is no meaningful "nearest" garden for it.
 */
export function keepTreeOffBuilding(
    t: SiteTree,
    house: { readonly widthMm: number; readonly depthMm: number },
    lot: {
        readonly minX: number;
        readonly maxX: number;
        readonly minY: number;
        readonly maxY: number;
    },
): SiteTree | null {
    const off =
        EXTERIOR_WALL_THICKNESS_MM / 2 + TREE_WALL_CLEARANCE_MM + t.radiusMm;
    const { x, y } = t.pos;
    const isClear =
        x <= -off ||
        x >= house.widthMm + off ||
        y <= -off ||
        y >= house.depthMm + off;
    if (isClear) return t;
    const isInside = x > 0 && x < house.widthMm && y > 0 && y < house.depthMm;
    if (isInside) return null;
    const candidates = [
        { gap: -y, pos: { x, y: -off } },
        { gap: y - house.depthMm, pos: { x, y: house.depthMm + off } },
        { gap: -x, pos: { x: -off, y } },
        { gap: x - house.widthMm, pos: { x: house.widthMm + off, y } },
    ].sort((a, b) => b.gap - a.gap);
    const pos = candidates[0]?.pos;
    if (!pos) return null;
    const isFitting =
        pos.x - t.radiusMm >= lot.minX &&
        pos.x + t.radiusMm <= lot.maxX &&
        pos.y - t.radiusMm >= lot.minY &&
        pos.y + t.radiusMm <= lot.maxY;
    return isFitting
        ? {
              pos: { x: Math.round(pos.x), y: Math.round(pos.y) },
              radiusMm: t.radiusMm,
          }
        : null;
}
