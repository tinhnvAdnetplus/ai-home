import { sunFace, type ModelFace, type RoadSide } from '@aihome/bdm';
import { type GridRect, type GridRoom } from './types.js';

/** Whether any rect lies on the given outside edge of a W × D floor (grid cells, y = 0 at the road). */
export function rectsTouchFace(
    rects: readonly GridRect[],
    face: ModelFace,
    W: number,
    D: number,
): boolean {
    return rects.some((rc) => {
        if (face === 'front') return rc.y === 0;
        if (face === 'back') return rc.y + rc.h === D;
        if (face === 'left') return rc.x === 0;
        return rc.x + rc.w === W;
    });
}

/** Whether the rooms open onto the sunny (south) side of the building. */
export function rectsTouchSun(
    rects: readonly GridRect[],
    road: RoadSide,
    W: number,
    D: number,
): boolean {
    return rectsTouchFace(rects, sunFace(road), W, D);
}

const SUN_EDGE: Record<ModelFace, string> = {
    front: 'y=0',
    back: 'y=gridD',
    left: 'x=0',
    right: 'x=gridW',
};

/** The south-facing outside edge in the AI layout's grid terms (y = 0 is the road). */
export function sunEdge(road: RoadSide): string {
    return SUN_EDGE[sunFace(road)];
}

/** Centre of the rects along x, as a fraction of W (0 = left edge). */
export function rectsCentreX(rects: readonly GridRect[], W: number): number {
    let cells = 0;
    let sum = 0;
    for (const rc of rects) {
        const n = rc.w * rc.h;
        cells += n;
        sum += n * (rc.x + rc.w / 2);
    }
    return cells > 0 && W > 0 ? sum / cells / W : 0.5;
}

/**
 * Bands always put the LDK at the back (y max). With an east or west road the sun is on
 * the left or right instead, so the plan is mirrored to bring the LDK to that side;
 * with a north or south road the variant's own mirroring stays.
 */
export function shouldMirrorForSun(
    isVariantMirror: boolean,
    road: RoadSide,
    f1Rooms: readonly GridRoom[],
    W: number,
    D1: number,
): boolean {
    const sun = sunFace(road);
    const ldk = f1Rooms.find((r) => r.type === 'ldk');
    if ((sun !== 'left' && sun !== 'right') || !ldk) return isVariantMirror;
    const other = sun === 'left' ? 'right' : 'left';
    const isOnSun = rectsTouchFace(ldk.rects, sun, W, D1);
    const isOnOther = rectsTouchFace(ldk.rects, other, W, D1);
    if (isOnSun !== isOnOther) return isOnOther;
    const centre = rectsCentreX(ldk.rects, W);
    if (centre === 0.5) return isVariantMirror;
    return sun === 'left' ? centre > 0.5 : centre < 0.5;
}
