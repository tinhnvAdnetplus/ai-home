import * as THREE from 'three';
import { type Fixture, type Floor, type Room } from '@aihome/bdm';
import { toThreeY } from './coords.js';
import { computePolygonBounds, isPointInPolygon } from './furniture-bounds.js';
import { placeRoomFurniture } from './furniture-placer.js';
import { resolveFixturePlacement, buildFixtureMesh } from './fixture-dispatch.js';
import {
    type DoorObstacle,
    type PlacementContext,
    type PlacementStats,
} from './furniture-types.js';
import { type MaterialRegistry, type Render3dOptions } from './types.js';

/** Which fixtures belong to which room, decided purely by geometry (the fixture's own center
 * falling inside the room polygon) since BDM's `Fixture` carries no room reference. Pulled out
 * as its own pure function so it is unit-testable without THREE. */
export function groupFixturesByRoom(
    rooms: readonly Room[],
    fixtures: readonly Fixture[],
): ReadonlyMap<string, readonly Fixture[]> {
    const byRoom = new Map<string, Fixture[]>();
    for (const fixture of fixtures) {
        const placement = resolveFixturePlacement(fixture);
        if (!placement) continue;
        const room = rooms.find((r) =>
            isPointInPolygon(placement.centerMmX, placement.centerMmY, r.polygon),
        );
        if (!room) continue;
        const list = byRoom.get(room.id) ?? [];
        list.push(fixture);
        byRoom.set(room.id, list);
    }
    return byRoom;
}

function collectDoorObstacles(floor: Floor): readonly DoorObstacle[] {
    const list: DoorObstacle[] = [];
    const doors = floor.openings.filter(
        (o) =>
            o.kind === 'door' ||
            o.kind === 'slidingDoor' ||
            o.kind === 'entrance',
    );
    for (const d of doors) {
        const wall = floor.walls.find((w) => w.id === d.wallId);
        if (!wall) continue;
        const dx = wall.b.x - wall.a.x;
        const dy = wall.b.y - wall.a.y;
        const len = Math.hypot(dx, dy);
        if (len < 1) continue;
        const ratio = Math.max(
            0,
            Math.min(1, (d.offsetMm + d.widthMm / 2) / len),
        );
        const x = wall.a.x + dx * ratio;
        const y = wall.a.y + dy * ratio;
        // sliding doors need no swing space; swing doors keep a smaller clear zone
        const radiusMm =
            d.kind === 'slidingDoor' ? 300 : d.kind === 'entrance' ? 600 : 520;
        list.push({ x, y, radiusMm });
    }
    return list;
}

export function buildFloorFixtures(
    floor: Floor,
    registry: MaterialRegistry,
    options?: Render3dOptions,
): THREE.Group {
    const group = new THREE.Group();
    group.name = `furniture-floor-${String(floor.level)}`;

    if (options?.isFurnitureVisible === false) {
        return group;
    }

    const elevM = toThreeY(floor.elevationMm);
    const obstacles = collectDoorObstacles(floor);
    const totalStats: PlacementStats = { placedCount: 0, skippedCount: 0 };
    const fixturesByRoom = groupFixturesByRoom(floor.rooms, floor.fixtures);

    for (const room of floor.rooms) {
        if (
            room.type === 'balcony' ||
            room.type === 'void' ||
            room.type === 'porch' ||
            room.type === 'deck' ||
            room.type === 'stairs'
        ) {
            continue;
        }

        const bounds = computePolygonBounds(room.polygon);
        const widthMm = bounds.maxX - bounds.minX;
        const depthMm = bounds.maxY - bounds.minY;
        if (widthMm < 800 || depthMm < 800) {
            continue;
        }

        // The planner (AI or rule-based) already decided what goes in this room and where, for
        // the same `fixtures` the 2D plan draws — render that directly instead of re-guessing.
        // A room with no recorded fixtures falls back to the old procedural placement, so this
        // is never worse than before.
        const roomFixtures = fixturesByRoom.get(room.id);
        if (roomFixtures && roomFixtures.length > 0) {
            for (const fixture of roomFixtures) {
                buildFixtureMesh(fixture, group, elevM, registry);
                totalStats.placedCount += 1;
            }
            continue;
        }

        const ctx: PlacementContext = {
            room,
            polygon: room.polygon,
            bounds,
            elevM,
            obstacles,
            placed: [],
            stats: totalStats,
        };

        placeRoomFurniture(ctx, group, registry);
    }

    group.userData = {
        placedCount: totalStats.placedCount,
        skippedCount: totalStats.skippedCount,
    };

    return group;
}
