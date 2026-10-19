import { type Floor, type Opening, type Wall } from "@aihome/bdm";
import {
  type ElevationSide,
  type ProjectedOpening,
  type ProjectedWall,
} from "./types.js";

export function projectOpeningToSide(
  opening: Opening,
  wall: Wall,
  projectedWall: ProjectedWall,
  floor: Floor,
  side: ElevationSide,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
): ProjectedOpening | null {
  const dx = wall.b.x - wall.a.x;
  const dy = wall.b.y - wall.a.y;
  const len = Math.hypot(dx, dy);
  if (len <= 0) return null;

  const ux = dx / len;
  const uy = dy / len;

  const p0x = wall.a.x + ux * opening.offsetMm;
  const p0y = wall.a.y + uy * opening.offsetMm;
  const p1x = p0x + ux * opening.widthMm;
  const p1y = p0y + uy * opening.widthMm;

  let uMin = 0;
  let uMax = 0;

  if (side === "south") {
    uMin = Math.min(p0x, p1x);
    uMax = Math.max(p0x, p1x);
  } else if (side === "north") {
    uMin = bounds.maxX - Math.max(p0x, p1x);
    uMax = bounds.maxX - Math.min(p0x, p1x);
  } else if (side === "east") {
    uMin = Math.min(p0y, p1y) - bounds.minY;
    uMax = Math.max(p0y, p1y) - bounds.minY;
  } else {
    uMin = bounds.maxY - Math.max(p0y, p1y);
    uMax = bounds.maxY - Math.min(p0y, p1y);
  }

  const sillElev = floor.elevationMm + Math.max(0, opening.sillMm);
  const heightMm = opening.heightMm > 0 ? opening.heightMm : 900;

  return {
    id: opening.id,
    wallId: wall.id,
    kind: opening.kind,
    uMin,
    uMax,
    sillElev,
    topElev: sillElev + heightMm,
    depth: projectedWall.depth,
  };
}
