import { type Fixture, type Point } from '@aihome/bdm';
import { type GridRoom, type PlanInput } from './types.js';
import { generateLdkFixtures } from './fixtures-ldk.js';

function getRoomBox(
    r: GridRoom,
    gridMm: number,
): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const rc of r.rects) {
        minX = Math.min(minX, rc.x * gridMm);
        maxX = Math.max(maxX, (rc.x + rc.w) * gridMm);
        minY = Math.min(minY, rc.y * gridMm);
        maxY = Math.max(maxY, (rc.y + rc.h) * gridMm);
    }
    return { minX, maxX, minY, maxY };
}

function pt(x: number, y: number): Point {
    return { x: Math.round(x), y: Math.round(y) };
}

export function generateFloorFixtures(
    level: number,
    rooms: readonly GridRoom[],
    v: PlanInput,
    gridMm: number,
): readonly Fixture[] {
    const fixtures: Fixture[] = [];
    const pfx = `fix-${level.toString()}`;

    for (const r of rooms) {
        const b = getRoomBox(r, gridMm);
        const rmW = b.maxX - b.minX;
        const rmH = b.maxY - b.minY;

        if (r.type === 'ldk') {
            fixtures.push(...generateLdkFixtures(pfx, b, v, pt));
        } else if (r.type === 'bath') {
            fixtures.push({
                id: `${pfx}-bath-${r.id}`,
                kind: 'bathtub',
                pos: pt(b.minX + 100, b.minY + 100),
                rotation: 0,
            });
        } else if (r.type === 'wash') {
            fixtures.push({
                id: `${pfx}-vanity-${r.id}`,
                kind: 'vanity',
                pos: pt(b.minX + 100, b.minY + 100),
                rotation: 0,
            });
            if (rmW >= 1800) {
                fixtures.push({
                    id: `${pfx}-wm-${r.id}`,
                    kind: 'washing_machine',
                    pos: pt(b.minX + 1050, b.minY + 100),
                    rotation: 0,
                });
            }
        } else if (r.type === 'toilet') {
            const midX = (b.minX + b.maxX) / 2;
            fixtures.push({
                id: `${pfx}-wc-${r.id}`,
                kind: 'toilet_bowl',
                pos: pt(midX - 225, b.minY + 150),
                rotation: 0,
            });
        } else if (r.type === 'bedroom' && r.key === 'master') {
            const bedX = b.minX + 150;
            const bedY = b.minY + 150;
            fixtures.push({
                id: `${pfx}-bed-master`,
                kind: 'bed_double',
                pos: pt(bedX, bedY),
                rotation: 0,
            });
        } else if (r.type === 'childRoom') {
            const bedX = b.minX + 150;
            const bedY = b.minY + 150;
            fixtures.push({
                id: `${pfx}-bed-${r.id}`,
                kind: 'bed_single',
                pos: pt(bedX, bedY),
                rotation: 0,
            });
            if (rmH >= 2700) {
                const deskY = Math.min(
                    b.maxY - 700,
                    Math.max(b.minY + 2150, b.maxY - 700),
                );
                fixtures.push({
                    id: `${pfx}-desk-${r.id}`,
                    kind: 'desk',
                    pos: pt(b.minX + 150, deskY),
                    rotation: 0,
                });
            }
        }
    }
    return fixtures;
}
