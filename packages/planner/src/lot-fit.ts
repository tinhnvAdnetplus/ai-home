import { type BuildingModel } from '@aihome/bdm';

export type LotOverflow = {
    /** metres the house sticks out across the frontage (sides, setbacks included) */
    readonly widthM: number;
    /** metres the house sticks out towards the back (rear setback included) */
    readonly depthM: number;
};

/** How far the walls reach past the buildable part of the lot; null when the house fits. */
export function lotOverflow(model: BuildingModel): LotOverflow | null {
    const xs = model.site.boundary.map((p) => p.x);
    const ys = model.site.boundary.map((p) => p.y);
    const walls = model.floors.flatMap((f) => f.walls);
    if (walls.length === 0 || xs.length === 0) return null;
    const { leftMm, rightMm, rearMm } = model.site.setbacks;
    const wx = walls.flatMap((w) => [w.a.x, w.b.x]);
    const wy = walls.flatMap((w) => [w.a.y, w.b.y]);
    const over = (mm: number): number =>
        mm > 50 ? Math.round(mm / 100) / 10 : 0;
    const widthM =
        over(Math.max(...wx) - (Math.max(...xs) - rightMm)) +
        over(Math.min(...xs) + leftMm - Math.min(...wx));
    const depthM = over(Math.max(...wy) - (Math.max(...ys) - rearMm));
    return widthM > 0 || depthM > 0 ? { widthM, depthM } : null;
}
