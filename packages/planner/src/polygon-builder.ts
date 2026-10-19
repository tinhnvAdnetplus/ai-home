import { type GridRect } from './types.js';

export function rectsToPolygon(
    rects: readonly GridRect[],
    gridMm: number,
): { x: number; y: number }[] {
    const r0 = rects[0];
    if (!r0) return [];
    if (rects.length === 1) {
        return [
            { x: r0.x * gridMm, y: r0.y * gridMm },
            { x: (r0.x + r0.w) * gridMm, y: r0.y * gridMm },
            { x: (r0.x + r0.w) * gridMm, y: (r0.y + r0.h) * gridMm },
            { x: r0.x * gridMm, y: (r0.y + r0.h) * gridMm },
        ];
    }

    const edgeMap = new Map<string, { x: number; y: number }>();
    const key = (x: number, y: number): string =>
        `${x.toString()},${y.toString()}`;

    const addEdge = (x1: number, y1: number, x2: number, y2: number): void => {
        const kFwd = `${key(x1, y1)}->${key(x2, y2)}`;
        const kRev = `${key(x2, y2)}->${key(x1, y1)}`;
        if (edgeMap.has(kRev)) {
            edgeMap.delete(kRev);
        } else {
            edgeMap.set(kFwd, { x: x2, y: y2 });
        }
    };

    for (const r of rects) {
        for (let cy = r.y; cy < r.y + r.h; cy++) {
            for (let cx = r.x; cx < r.x + r.w; cx++) {
                addEdge(cx, cy, cx + 1, cy);
                addEdge(cx + 1, cy, cx + 1, cy + 1);
                addEdge(cx + 1, cy + 1, cx, cy + 1);
                addEdge(cx, cy + 1, cx, cy);
            }
        }
    }

    if (edgeMap.size === 0) return [];

    const startKey = edgeMap.keys().next().value;
    if (!startKey) return [];
    const [sxStr, syStr] = startKey.split('->')[0]?.split(',') ?? ['0', '0'];
    let curX = Number(sxStr);
    let curY = Number(syStr);

    const poly: { x: number; y: number }[] = [];
    let guard = 0;
    while (guard++ < 2000) {
        poly.push({ x: curX * gridMm, y: curY * gridMm });
        const prefix = `${key(curX, curY)}->`;
        let nextPt: { x: number; y: number } | undefined;
        let matchedK: string | undefined;
        for (const [k, pt] of edgeMap.entries()) {
            if (k.startsWith(prefix)) {
                nextPt = pt;
                matchedK = k;
                break;
            }
        }
        if (!nextPt || !matchedK) break;
        edgeMap.delete(matchedK);
        curX = nextPt.x;
        curY = nextPt.y;
        if (curX === Number(sxStr) && curY === Number(syStr)) break;
    }

    // Simplify collinear vertices
    const simplified: { x: number; y: number }[] = [];
    for (let i = 0; i < poly.length; i++) {
        const prev = poly[(i - 1 + poly.length) % poly.length];
        const cur = poly[i];
        const next = poly[(i + 1) % poly.length];
        if (!prev || !cur || !next) continue;
        const isCollinearX = prev.x === cur.x && cur.x === next.x;
        const isCollinearY = prev.y === cur.y && cur.y === next.y;
        if (!isCollinearX && !isCollinearY) {
            simplified.push(cur);
        }
    }

    return simplified.length >= 3 ? simplified : poly;
}
