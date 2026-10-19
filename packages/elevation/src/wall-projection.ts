import { type Floor, type Wall } from "@aihome/bdm";
import { type ElevationSide, type ProjectedWall } from "./types.js";

function isPointInPoly(
  px: number,
  py: number,
  poly: readonly { x: number; y: number }[],
): boolean {
  let isInside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i]?.x ?? 0;
    const yi = poly[i]?.y ?? 0;
    const xj = poly[j]?.x ?? 0;
    const yj = poly[j]?.y ?? 0;
    const isIntersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (isIntersect) isInside = !isInside;
  }
  return isInside;
}

function isInsideAnyRoom(px: number, py: number, floor: Floor): boolean {
  for (const room of floor.rooms) {
    if (isPointInPoly(px, py, room.polygon)) return true;
  }
  return false;
}

export function doesWallFaceSide(
  wall: Wall,
  side: ElevationSide,
  floor: Floor,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
): boolean {
  const isHoriz =
    Math.abs(wall.b.x - wall.a.x) >= Math.abs(wall.b.y - wall.a.y);
  const midX = (wall.a.x + wall.b.x) / 2;
  const midY = (wall.a.y + wall.b.y) / 2;

  if (side === "south" || side === "north") {
    if (!isHoriz) return false;
    const isNorthInside = isInsideAnyRoom(midX, midY + 50, floor);
    const isSouthInside = isInsideAnyRoom(midX, midY - 50, floor);
    if (isNorthInside && !isSouthInside) return side === "south";
    if (isSouthInside && !isNorthInside) return side === "north";
    return side === "south"
      ? midY <= (bounds.minY + bounds.maxY) / 2
      : midY >= (bounds.minY + bounds.maxY) / 2;
  }

  if (isHoriz) return false;
  const isEastInside = isInsideAnyRoom(midX + 50, midY, floor);
  const isWestInside = isInsideAnyRoom(midX - 50, midY, floor);
  if (isWestInside && !isEastInside) return side === "east";
  if (isEastInside && !isWestInside) return side === "west";
  return side === "east"
    ? midX >= (bounds.minX + bounds.maxX) / 2
    : midX <= (bounds.minX + bounds.maxX) / 2;
}

export function projectWallToSide(
  wall: Wall,
  floor: Floor,
  side: ElevationSide,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
): ProjectedWall {
  const x1 = Math.min(wall.a.x, wall.b.x);
  const x2 = Math.max(wall.a.x, wall.b.x);
  const y1 = Math.min(wall.a.y, wall.b.y);
  const y2 = Math.max(wall.a.y, wall.b.y);

  let uMin = 0;
  let uMax = 0;
  let depth = 0;

  if (side === "south") {
    uMin = x1;
    uMax = x2;
    depth = (wall.a.y + wall.b.y) / 2;
  } else if (side === "north") {
    uMin = bounds.maxX - x2;
    uMax = bounds.maxX - x1;
    depth = -(wall.a.y + wall.b.y) / 2;
  } else if (side === "east") {
    uMin = y1 - bounds.minY;
    uMax = y2 - bounds.minY;
    depth = -(wall.a.x + wall.b.x) / 2;
  } else {
    uMin = bounds.maxY - y2;
    uMax = bounds.maxY - y1;
    depth = (wall.a.x + wall.b.x) / 2;
  }

  return {
    floorLevel: floor.level,
    uMin,
    uMax,
    botElev: floor.elevationMm,
    topElev: floor.elevationMm + (floor.heightMm > 0 ? floor.heightMm : 2800),
    depth,
    wallId: wall.id,
  };
}
