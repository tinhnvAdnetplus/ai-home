import { type BuildingModel, type BdmIssue } from './types.js';

function checkUniqueIds(model: BuildingModel, issues: BdmIssue[]): void {
    const seenFloorLevels = new Set<number>();
    const seenRoomIds = new Set<string>();
    const seenWallIds = new Set<string>();
    const seenOpeningIds = new Set<string>();

    for (const [floorIndex, floor] of model.floors.entries()) {
        if (seenFloorLevels.has(floor.level)) {
            issues.push({
                path: ['floors', floorIndex, 'level'],
                code: 'DUPLICATE_FLOOR_LEVEL',
                message: `Duplicate floor level ${floor.level.toString()}`,
            });
        }
        seenFloorLevels.add(floor.level);

        for (const [roomIndex, room] of floor.rooms.entries()) {
            if (seenRoomIds.has(room.id)) {
                issues.push({
                    path: ['floors', floorIndex, 'rooms', roomIndex, 'id'],
                    code: 'DUPLICATE_ROOM_ID',
                    message: `Duplicate room ID '${room.id}'`,
                });
            }
            seenRoomIds.add(room.id);
        }

        for (const [wallIndex, wall] of floor.walls.entries()) {
            if (seenWallIds.has(wall.id)) {
                issues.push({
                    path: ['floors', floorIndex, 'walls', wallIndex, 'id'],
                    code: 'DUPLICATE_WALL_ID',
                    message: `Duplicate wall ID '${wall.id}'`,
                });
            }
            seenWallIds.add(wall.id);
        }

        for (const [opIndex, opening] of floor.openings.entries()) {
            if (seenOpeningIds.has(opening.id)) {
                issues.push({
                    path: ['floors', floorIndex, 'openings', opIndex, 'id'],
                    code: 'DUPLICATE_OPENING_ID',
                    message: `Duplicate opening ID '${opening.id}'`,
                });
            }
            seenOpeningIds.add(opening.id);
        }
    }
}

function checkOpeningWallsAndBounds(
    model: BuildingModel,
    issues: BdmIssue[],
): void {
    for (const [floorIndex, floor] of model.floors.entries()) {
        const wallMap = new Map(floor.walls.map((w) => [w.id, w]));
        for (const [opIndex, opening] of floor.openings.entries()) {
            const wall = wallMap.get(opening.wallId);
            if (!wall) {
                issues.push({
                    path: ['floors', floorIndex, 'openings', opIndex, 'wallId'],
                    code: 'UNKNOWN_WALL_REF',
                    message: `Opening references non-existent wall ID '${opening.wallId}'`,
                });
                continue;
            }
            const wallLength = Math.hypot(
                wall.b.x - wall.a.x,
                wall.b.y - wall.a.y,
            );
            if (
                opening.offsetMm < 0 ||
                opening.offsetMm + opening.widthMm > wallLength + 10
            ) {
                issues.push({
                    path: ['floors', floorIndex, 'openings', opIndex],
                    code: 'OPENING_OUT_OF_BOUNDS',
                    message: `Opening exceeds wall length (${wallLength.toFixed(0)}mm)`,
                });
            }
        }
    }
}

function checkRoomPolygons(model: BuildingModel, issues: BdmIssue[]): void {
    for (const [floorIndex, floor] of model.floors.entries()) {
        for (const [roomIndex, room] of floor.rooms.entries()) {
            if (room.polygon.length < 3) {
                issues.push({
                    path: ['floors', floorIndex, 'rooms', roomIndex, 'polygon'],
                    code: 'INVALID_POLYGON',
                    message: `Room polygon must have at least 3 vertices (found ${room.polygon.length.toString()})`,
                });
            }
        }
    }
}

function checkFixtures(model: BuildingModel, issues: BdmIssue[]): void {
    for (const [floorIndex, floor] of model.floors.entries()) {
        if (floor.fixtures.length === 0) continue;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const w of floor.walls) {
            maxX = Math.max(maxX, w.a.x, w.b.x);
            maxY = Math.max(maxY, w.a.y, w.b.y);
        }
        for (const [fixIndex, fix] of floor.fixtures.entries()) {
            if (
                fix.pos.x < -500 ||
                fix.pos.x > maxX + 500 ||
                fix.pos.y < -500 ||
                fix.pos.y > maxY + 500
            ) {
                issues.push({
                    path: ['floors', floorIndex, 'fixtures', fixIndex],
                    code: 'FIXTURE_OUT_OF_BOUNDS',
                    message: `Fixture '${fix.id}' outside floor boundaries`,
                });
            }
        }
    }
}

export function crossValidateBuildingModel(
    model: BuildingModel,
): readonly BdmIssue[] {
    const issues: BdmIssue[] = [];
    checkUniqueIds(model, issues);
    checkOpeningWallsAndBounds(model, issues);
    checkRoomPolygons(model, issues);
    checkFixtures(model, issues);
    return issues;
}
