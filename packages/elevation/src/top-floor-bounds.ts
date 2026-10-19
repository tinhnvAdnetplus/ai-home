import { type Floor } from "@aihome/bdm";

export type TopFloorBox = {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
};

export function computeTopFloorBox(
  topFloor: Floor | undefined,
  fallback: TopFloorBox,
): TopFloorBox {
  if (!topFloor || topFloor.walls.length === 0) return fallback;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const w of topFloor.walls) {
    minX = Math.min(minX, w.a.x, w.b.x);
    maxX = Math.max(maxX, w.a.x, w.b.x);
    minY = Math.min(minY, w.a.y, w.b.y);
    maxY = Math.max(maxY, w.a.y, w.b.y);
  }

  if (!Number.isFinite(minX)) return fallback;
  return { minX, maxX, minY, maxY };
}
