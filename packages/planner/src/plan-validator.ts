import { type BdmIssue, type BuildingModel } from '@aihome/bdm';
import { floorBounds, polygonBounds, roomAt } from './layout-geometry.js';
import { reachableRoomIds } from './layout-reach.js';
import { OPEN_ROOM_TYPES } from './room-kinds.js';

const CIRCULATION = OPEN_ROOM_TYPES;
const HABITABLE = new Set(['bedroom', 'childRoom', 'ldk', 'study', 'washitsu']);

function issue(
    code: string,
    message: string,
    level: 'warn' | 'error',
): BdmIssue {
    return { path: ['layout'], code, message, level };
}

export function validateLayout(model: BuildingModel): BdmIssue[] {
    const out: BdmIssue[] = [];
    const bd = model.site.boundary;
    const maxBoundX = Math.max(...bd.map((p) => p.x));
    const maxBoundY = Math.max(...bd.map((p) => p.y));
    for (const floor of model.floors) {
        const { maxX, maxY } = floorBounds(floor);
        if (
            maxX > maxBoundX - model.site.setbacks.rightMm + 1 ||
            maxY > maxBoundY - model.site.setbacks.rearMm + 1
        ) {
            out.push(
                issue(
                    'LAYOUT_OUTSIDE_LOT',
                    `${floor.level.toString()}階の外形が敷地（外壁後退）に収まりません。`,
                    'error',
                ),
            );
        }
        const roomArea = floor.rooms.reduce((s, r) => s + r.areaM2, 0);
        const footprint = (maxX * maxY) / 1e6;
        if (Math.abs(roomArea - footprint) > 0.6) {
            out.push(
                issue(
                    'LAYOUT_VOID_AREA',
                    `${floor.level.toString()}階に部屋に割り当てられていない領域があります。`,
                    'error',
                ),
            );
        }
        const start = floor.rooms
            .filter((r) => r.type === 'entrance' || r.type === 'hall')
            .map((r) => r.id);
        if (floor.level === 1 && start.length > 0) {
            const reach = reachableRoomIds(floor, start.slice(0, 1));
            const lost = floor.rooms.filter(
                (r) =>
                    !reach.has(r.id) &&
                    r.type !== 'void' &&
                    r.type !== 'closet',
            );
            if (lost.length > 0) {
                out.push(
                    issue(
                        'LAYOUT_UNREACHABLE',
                        `動線でつながらない部屋があります: ${lost.map((r) => r.name).join('、')}`,
                        'error',
                    ),
                );
            }
        }
        const stair = floor.rooms.find((r) => r.type === 'stairs');
        if (stair) {
            const b = polygonBounds(stair.polygon);
            const landing = roomAt(floor, (b.minX + b.maxX) / 2, b.maxY + 200);
            const isBlocked = floor.walls.some(
                (w) =>
                    w.kind === 'interior' &&
                    w.a.y === b.maxY &&
                    w.b.y === b.maxY &&
                    Math.max(w.a.x, w.b.x) > b.minX &&
                    Math.min(w.a.x, w.b.x) < b.maxX,
            );
            if (isBlocked) {
                out.push(
                    issue(
                        'LAYOUT_STAIR_BLOCKED',
                        `${floor.level.toString()}階の階段の出入口に壁があり通れません。`,
                        'error',
                    ),
                );
            }
            if (
                !landing ||
                !CIRCULATION.has(landing.type) ||
                landing.type === 'stairs'
            ) {
                out.push(
                    issue(
                        'LAYOUT_STAIR_NO_LANDING',
                        `${floor.level.toString()}階の階段の出入口が廊下・ホールにつながっていません。`,
                        'error',
                    ),
                );
            }
        }
        for (const r of floor.rooms) {
            const b = polygonBounds(r.polygon);
            const minSide = Math.min(b.maxX - b.minX, b.maxY - b.minY);
            if (HABITABLE.has(r.type) && minSide < 1800) {
                out.push(
                    issue(
                        'LAYOUT_ROOM_TOO_NARROW',
                        `${r.name}の幅が狭すぎます（${(minSide / 1000).toFixed(1)}m）。`,
                        'warn',
                    ),
                );
            }
        }
    }
    if (model.floors.length >= 2) {
        const stair1 = model.floors[0]?.rooms.find((r) => r.type === 'stairs');
        const stair2 = model.floors[1]?.rooms.find((r) => r.type === 'stairs');
        if (stair1 && stair2) {
            const b1 = polygonBounds(stair1.polygon);
            const b2 = polygonBounds(stair2.polygon);
            const dx = Math.abs(b1.minX - b2.minX);
            const dy = Math.abs(b1.minY - b2.minY);
            const dw = Math.abs(b1.maxX - b1.minX - (b2.maxX - b2.minX));
            const dh = Math.abs(b1.maxY - b1.minY - (b2.maxY - b2.minY));
            if (dx > 10 || dy > 10 || dw > 10 || dh > 10) {
                out.push(
                    issue(
                        'LAYOUT_STAIR_MISALIGNED',
                        '1階と2階の階段の位置またはサイズが一致していません。',
                        'error',
                    ),
                );
            }
        }
    }
    return out;
}
