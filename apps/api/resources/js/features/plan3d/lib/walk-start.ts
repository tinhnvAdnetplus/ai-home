import { type BuildingModel, type Floor } from '@aihome/bdm';
import { toThreeX, toThreeZ } from '@aihome/render3d';

export type WalkStart = {
    readonly x: number;
    readonly z: number;
    readonly yaw: number;
};

function floorCenter(floor: Floor): { x: number; z: number } {
    let [minX, maxX, minY, maxY] = [Infinity, -Infinity, Infinity, -Infinity];
    for (const w of floor.walls) {
        minX = Math.min(minX, w.a.x, w.b.x);
        maxX = Math.max(maxX, w.a.x, w.b.x);
        minY = Math.min(minY, w.a.y, w.b.y);
        maxY = Math.max(maxY, w.a.y, w.b.y);
    }
    return { x: toThreeX((minX + maxX) / 2), z: toThreeZ((minY + maxY) / 2) };
}

export function yawToward(dx: number, dz: number): number {
    return Math.atan2(-dx, -dz);
}

export function findFloor(
    model: BuildingModel,
    level: number,
): Floor | undefined {
    return model.floors.find((f) => f.level === level) ?? model.floors[0];
}

export function computeWalkStart(
    model: BuildingModel,
    level: number,
): WalkStart {
    const floor = findFloor(model, level);
    if (!floor) return { x: 0, z: 0, yaw: 0 };
    const center = floorCenter(floor);
    const stair = floor.stairs[0];
    if (level > 1 && stair && stair.polygon.length > 0) {
        const n = stair.polygon.length;
        const sx = stair.polygon.reduce((s, p) => s + p.x, 0) / n;
        const sy = stair.polygon.reduce((s, p) => s + p.y, 0) / n;
        const [x, z] = [toThreeX(sx), toThreeZ(sy)];
        return { x, z, yaw: yawToward(center.x - x, center.z - z) };
    }
    const door =
        floor.openings.find((o) => o.kind === 'entrance') ??
        floor.openings.find((o) => o.kind === 'door');
    const wall = floor.walls.find((w) => w.id === door?.wallId);
    if (door && wall) {
        const len = Math.max(
            1,
            Math.hypot(wall.b.x - wall.a.x, wall.b.y - wall.a.y),
        );
        const r = (door.offsetMm + door.widthMm / 2) / len;
        const x = toThreeX(wall.a.x + (wall.b.x - wall.a.x) * r);
        const z = toThreeZ(wall.a.y + (wall.b.y - wall.a.y) * r);
        const [wx, wz] = [wall.b.x - wall.a.x, -(wall.b.y - wall.a.y)];
        const wl = Math.max(1e-6, Math.hypot(wx, wz));
        let [nx, nz] = [-wz / wl, wx / wl];
        if (nx * (center.x - x) + nz * (center.z - z) < 0)
            [nx, nz] = [-nx, -nz];
        return {
            x: x + nx * 1.0,
            z: z + nz * 1.0,
            yaw: yawToward(nx, nz),
        };
    }
    return { x: center.x, z: center.z, yaw: 0 };
}
