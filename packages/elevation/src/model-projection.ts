import { type BuildingModel, type Wall } from "@aihome/bdm";
import {
  type ElevationLevelLine,
  type ElevationProjection,
  type ElevationSide,
  type ProjectedOpening,
  type ProjectedWall,
} from "./types.js";
import { FOUNDATION_HEIGHT_MM } from "./constants.js";
import { buildProjectedRoof } from "./roof-projection.js";
import { doesWallFaceSide, projectWallToSide } from "./wall-projection.js";
import { projectOpeningToSide } from "./opening-projection.js";
import { computeTopFloorBox } from "./top-floor-bounds.js";

export function computeModelBounds(model: BuildingModel): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  eaveElev: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let maxElev = 0;

  for (const f of model.floors) {
    const top = f.elevationMm + (f.heightMm > 0 ? f.heightMm : 2800);
    if (top > maxElev) maxElev = top;
    for (const w of f.walls) {
      minX = Math.min(minX, w.a.x, w.b.x);
      maxX = Math.max(maxX, w.a.x, w.b.x);
      minY = Math.min(minY, w.a.y, w.b.y);
      maxY = Math.max(maxY, w.a.y, w.b.y);
    }
  }

  if (!Number.isFinite(minX)) {
    return { minX: 0, maxX: 9100, minY: 0, maxY: 7280, eaveElev: 5700 };
  }
  return { minX, maxX, minY, maxY, eaveElev: maxElev };
}

export function projectModel(
  model: BuildingModel,
  side: ElevationSide,
): ElevationProjection {
  const bounds = computeModelBounds(model);
  const isEW = side === "east" || side === "west";
  const uSpan = isEW ? bounds.maxY - bounds.minY : bounds.maxX - bounds.minX;
  const uMin = 0;
  const uMax = Math.max(1000, uSpan);

  const projectedWalls: ProjectedWall[] = [];
  const projectedOpenings: ProjectedOpening[] = [];

  for (const floor of model.floors) {
    const wallMap = new Map<string, Wall>();
    for (const w of floor.walls) wallMap.set(w.id, w);

    for (const wall of floor.walls) {
      if (wall.kind !== "exterior") continue;
      if (!doesWallFaceSide(wall, side, floor, bounds)) continue;

      const pw = projectWallToSide(wall, floor, side, bounds);
      projectedWalls.push(pw);

      for (const op of floor.openings) {
        if (op.wallId !== wall.id) continue;
        const po = projectOpeningToSide(op, wall, pw, floor, side, bounds);
        if (po) projectedOpenings.push(po);
      }
    }
  }

  projectedWalls.sort((a, b) => b.depth - a.depth);
  projectedOpenings.sort((a, b) => b.depth - a.depth);

  const topFloor = model.floors[model.floors.length - 1];
  const topBox = computeTopFloorBox(topFloor, bounds);

  let uMinTop = 0;
  let uMaxTop = uMax;
  if (side === "south") {
    uMinTop = topBox.minX - bounds.minX;
    uMaxTop = topBox.maxX - bounds.minX;
  } else if (side === "north") {
    uMinTop = bounds.maxX - topBox.maxX;
    uMaxTop = bounds.maxX - topBox.minX;
  } else if (side === "east") {
    uMinTop = topBox.minY - bounds.minY;
    uMaxTop = topBox.maxY - bounds.minY;
  } else {
    uMinTop = bounds.maxY - topBox.maxY;
    uMaxTop = bounds.maxY - topBox.minY;
  }

  const secondFloor = model.floors[1];
  const secondFloorElev = secondFloor ? secondFloor.elevationMm : 0;
  const roof = buildProjectedRoof(
    model,
    side,
    bounds,
    uMinTop,
    uMaxTop,
    uMin,
    uMax,
    secondFloorElev,
  );

  const groundElev = -FOUNDATION_HEIGHT_MM;
  const eavesElev = bounds.eaveElev;
  const ridgeElev = roof.ridgeElev;

  const levels: ElevationLevelLine[] = [
    { label: "GL", elevationMm: groundElev },
    ...model.floors.map((f) => ({
      label: `${f.level.toString()}FL`,
      elevationMm: f.elevationMm,
    })),
    { label: "軒高", elevationMm: eavesElev },
    { label: "最高高", elevationMm: ridgeElev },
  ];

  return {
    side,
    walls: projectedWalls,
    openings: projectedOpenings,
    roof,
    levels,
    uMin,
    uMax,
    groundElev,
    eavesElev,
    ridgeElev,
  };
}
