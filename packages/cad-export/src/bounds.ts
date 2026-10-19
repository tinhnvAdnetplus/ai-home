import { type BuildingModel } from "@aihome/bdm";
import { type BoundingBox2D } from "./types.js";

export function computeModelBounds(
  model: BuildingModel,
  floorLevels: readonly number[],
  hasSite: boolean,
): BoundingBox2D {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  if (hasSite) {
    for (const pt of model.site.boundary) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
  }

  const selectedSet = new Set(floorLevels);
  for (const floor of model.floors) {
    if (!selectedSet.has(floor.level)) continue;
    for (const wall of floor.walls) {
      if (wall.a.x < minX) minX = wall.a.x;
      if (wall.a.y < minY) minY = wall.a.y;
      if (wall.a.x > maxX) maxX = wall.a.x;
      if (wall.a.y > maxY) maxY = wall.a.y;
      if (wall.b.x < minX) minX = wall.b.x;
      if (wall.b.y < minY) minY = wall.b.y;
      if (wall.b.x > maxX) maxX = wall.b.x;
      if (wall.b.y > maxY) maxY = wall.b.y;
    }
    for (const room of floor.rooms) {
      for (const pt of room.polygon) {
        if (pt.x < minX) minX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y > maxY) maxY = pt.y;
      }
    }
  }

  if (minX === Infinity) {
    return { minX: 0, minY: 0, maxX: 15000, maxY: 15000 };
  }

  return {
    minX: minX - 1500,
    minY: minY - 1500,
    maxX: maxX + 1500,
    maxY: maxY + 1500,
  };
}
