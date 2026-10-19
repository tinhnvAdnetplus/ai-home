import { type Point, type Wall, type Opening } from '@aihome/bdm';

export type OpeningRenderData = {
    readonly p0: Point;
    readonly p1: Point;
    readonly kind: Opening['kind'];
    readonly arcPath?: string | undefined;
    readonly leafP?: Point | undefined;
};

export function computeOpeningRenderData(
    opening: Opening,
    wall: Wall,
): OpeningRenderData | null {
    const dx = wall.b.x - wall.a.x;
    const dy = wall.b.y - wall.a.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return null;

    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    const p0: Point = {
        x: Math.round(wall.a.x + ux * opening.offsetMm),
        y: Math.round(wall.a.y + uy * opening.offsetMm),
    };
    const p1: Point = {
        x: Math.round(p0.x + ux * opening.widthMm),
        y: Math.round(p0.y + uy * opening.widthMm),
    };

    if (opening.kind === 'door' || opening.kind === 'entrance') {
        const leafP: Point = {
            x: Math.round(p0.x + nx * opening.widthMm),
            y: Math.round(p0.y + ny * opening.widthMm),
        };
        const arcPath = `M ${p1.x.toString()} ${p1.y.toString()} A ${opening.widthMm.toString()} ${opening.widthMm.toString()} 0 0 0 ${leafP.x.toString()} ${leafP.y.toString()}`;
        return { p0, p1, kind: opening.kind, arcPath, leafP };
    }

    return { p0, p1, kind: opening.kind };
}

export type StairTread = {
    readonly a: Point;
    readonly b: Point;
};

export function computeStairTreads(
    bounds: { minX: number; minY: number; width: number; height: number },
    steps = 12,
): readonly StairTread[] {
    const treads: StairTread[] = [];
    const isVertical = bounds.height >= bounds.width;

    if (isVertical) {
        const stepSize = bounds.height / steps;
        for (let i = 1; i < steps; i++) {
            const y = Math.round(bounds.minY + i * stepSize);
            treads.push({
                a: { x: bounds.minX, y },
                b: { x: bounds.minX + bounds.width, y },
            });
        }
    } else {
        const stepSize = bounds.width / steps;
        for (let i = 1; i < steps; i++) {
            const x = Math.round(bounds.minX + i * stepSize);
            treads.push({
                a: { x, y: bounds.minY },
                b: { x, y: bounds.minY + bounds.height },
            });
        }
    }
    return treads;
}
