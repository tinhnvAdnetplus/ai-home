import { type BuildingModel } from "@aihome/bdm";
import { type ElevationSide, type ProjectedRoof } from "./types.js";
import { DEFAULT_ROOF_OVERHANG_MM, DEFAULT_ROOF_PITCH } from "./constants.js";
import { computeLowerRoofs } from "./lower-roofs.js";

type ModelBounds = {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly eaveElev: number;
};

export function buildProjectedRoof(
  model: BuildingModel,
  side: ElevationSide,
  bounds: ModelBounds,
  uMin: number,
  uMax: number,
  uMinOverall = uMin,
  uMaxOverall = uMax,
  secondFloorElev = 0,
): ProjectedRoof {
  const overhang =
    model.roof.overhangMm > 0
      ? model.roof.overhangMm
      : DEFAULT_ROOF_OVERHANG_MM;
  const pitch = model.roof.pitch > 0 ? model.roof.pitch : DEFAULT_ROOF_PITCH;
  const slope = pitch / 10;
  const kind = model.roof.kind;
  const isEW = side === "east" || side === "west";

  const depthMm = bounds.maxY - bounds.minY + 2 * overhang;
  const uL = uMin - overhang;
  const uR = uMax + overhang;
  const uMid = (uMin + uMax) / 2;
  const lrOpt = computeLowerRoofs(
    uMin,
    uMax,
    uMinOverall,
    uMaxOverall,
    secondFloorElev,
  );

  if (kind === "flat") {
    const top = bounds.eaveElev + 350;
    const pts = [
      { x: uMin - 100, y: bounds.eaveElev },
      { x: uMax + 100, y: bounds.eaveElev },
      { x: uMax + 100, y: top },
      { x: uMin - 100, y: top },
    ];
    return {
      kind,
      uMin: uMin - 100,
      uMax: uMax + 100,
      eaveElev: bounds.eaveElev,
      ridgeElev: top,
      ridgeU: uMid,
      points: pts,
      lowerRoofs: lrOpt,
    };
  }

  if (kind === "shed") {
    const top = bounds.eaveElev + depthMm * slope;
    const isEast = side === "east";
    const startY =
      side === "south" ? bounds.eaveElev + 200 : isEast ? bounds.eaveElev : top;
    const endY =
      side === "south" ? bounds.eaveElev + 200 : isEast ? top : bounds.eaveElev;
    const pts =
      side === "north"
        ? [
            { x: uL, y: top - 200 },
            { x: uR, y: top - 200 },
            { x: uR, y: top },
            { x: uL, y: top },
          ]
        : [
            { x: uL, y: bounds.eaveElev },
            { x: uR, y: bounds.eaveElev },
            { x: uR, y: endY },
            { x: uL, y: startY },
          ];
    return {
      kind,
      uMin: uL,
      uMax: uR,
      eaveElev: bounds.eaveElev,
      ridgeElev: top,
      ridgeU: side === "west" ? uL : isEast ? uR : uMid,
      points: pts,
      lowerRoofs: lrOpt,
    };
  }

  const ridgeElev = bounds.eaveElev + (depthMm / 2) * slope;
  const pts = isEW
    ? [
        { x: uL, y: bounds.eaveElev },
        { x: uMid, y: ridgeElev },
        { x: uR, y: bounds.eaveElev },
      ]
    : [
        { x: uL, y: bounds.eaveElev },
        { x: uR, y: bounds.eaveElev },
        { x: uR, y: ridgeElev },
        { x: uL, y: ridgeElev },
      ];
  const gablePts = isEW
    ? [
        { x: uMin, y: bounds.eaveElev },
        { x: uMid, y: ridgeElev },
        { x: uMax, y: bounds.eaveElev },
      ]
    : undefined;

  return {
    kind,
    uMin: uL,
    uMax: uR,
    eaveElev: bounds.eaveElev,
    ridgeElev,
    ridgeU: uMid,
    points: pts,
    gablePoints: gablePts,
    lowerRoofs: lrOpt,
  };
}
