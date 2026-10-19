import { type Floor, type Wall } from '@aihome/bdm';

/**
 * The [start, end] range (in mm, along the wall from a to b) that the entrance room's own
 * footprint actually borders. Only this stretch should get the lighter "entrance" wall tone -
 * not the full length of a wall id that also fronts neighbouring rooms (e.g. the whole facade).
 */
export function computeEntranceAccentBand(
    floor: Floor,
    wall: Wall,
    lenMm: number,
): readonly [number, number] | null {
    const entry = floor.rooms.find((r) => r.type === 'entrance');
    if (!entry) return null;

    const dx = wall.b.x - wall.a.x;
    const dy = wall.b.y - wall.a.y;
    const len = Math.hypot(dx, dy) || 1;
    const [ux, uy] = [dx / len, dy / len];

    let [minT, maxT] = [Infinity, -Infinity];
    for (const pt of entry.polygon) {
        const t = (pt.x - wall.a.x) * ux + (pt.y - wall.a.y) * uy;
        // keep only points that actually lie on this wall's line (within its thickness)
        const perp = Math.abs(-(pt.x - wall.a.x) * uy + (pt.y - wall.a.y) * ux);
        if (perp <= (wall.thicknessMm || 150) + 50) {
            minT = Math.min(minT, t);
            maxT = Math.max(maxT, t);
        }
    }
    if (!Number.isFinite(minT) || !Number.isFinite(maxT)) return null;
    return [Math.max(0, minT), Math.min(lenMm, maxT)];
}
