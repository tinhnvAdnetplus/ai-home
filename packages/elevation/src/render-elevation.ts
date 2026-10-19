import { type BuildingModel, type Floor } from "@aihome/bdm";
import { type ElevationSide, type RenderElevationOptions } from "./types.js";
import { DEFAULT_COLORS, DEFAULT_SCALE, MARGINS } from "./constants.js";
import { projectModel } from "./model-projection.js";
import { projectionSideFor } from "./projection-side.js";
import { renderGroundAndFoundation } from "./render-ground.js";
import { renderWallsAndOpenings } from "./render-walls.js";
import { renderRoof } from "./render-roof.js";
import { renderLevelLines } from "./render-levels.js";
import {
  renderHeightDimensions,
  renderWidthDimension,
} from "./render-dimensions.js";
import { renderTitleBlock } from "./render-title.js";
import { formatNum, renderErrorSvg } from "./svg-utils.js";

/** `side` is the real compass direction; the title says it and the projection turns with the road. */
export function renderElevation(
  model: BuildingModel,
  side: ElevationSide,
  opts: RenderElevationOptions = {},
): string {
  try {
    const rawModel: unknown = model;
    if (
      typeof rawModel !== "object" ||
      rawModel === null ||
      !("floors" in rawModel)
    ) {
      return renderErrorSvg("Invalid BuildingModel structure");
    }

    const proj = projectModel(model, projectionSideFor(model, side));
    const maxElev = proj.ridgeElev + 600;
    const elevToSvgY = (elev: number): number => maxElev - elev;

    const wallCol = opts.wallColor ?? DEFAULT_COLORS.wall;
    const roofCol = opts.roofColor ?? DEFAULT_COLORS.roof;
    const frameCol = opts.frameColor ?? DEFAULT_COLORS.frame;
    const glassCol = opts.glassColor ?? DEFAULT_COLORS.glass;
    const lineCol = opts.lineColor ?? DEFAULT_COLORS.line;
    const groundCol = opts.groundColor ?? DEFAULT_COLORS.ground;
    const foundCol = opts.foundationColor ?? DEFAULT_COLORS.foundation;
    const scale = opts.scale ?? DEFAULT_SCALE;
    const hasChimney = opts.hasChimney ?? false;
    const shouldShowDims = opts.hasDimensions ?? true;
    const shouldShowLevels = opts.hasLevels ?? true;

    const vbX = proj.uMin - MARGINS.left;
    const vbW = proj.uMax - proj.uMin + MARGINS.left + MARGINS.right;
    const vbY = elevToSvgY(proj.ridgeElev) - MARGINS.top;
    const vbH = elevToSvgY(proj.groundElev) + MARGINS.bottom - vbY;

    const firstFloor: Floor | undefined = model.floors[0];
    const firstFloorElev = firstFloor ? firstFloor.elevationMm : 0;

    const layers: string[] = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${formatNum(vbX)} ${formatNum(vbY)} ${formatNum(vbW)} ${formatNum(vbH)}" width="100%" height="100%">`,
      `<rect x="${formatNum(vbX)}" y="${formatNum(vbY)}" width="${formatNum(vbW)}" height="${formatNum(vbH)}" fill="#ffffff" />`,
      renderGroundAndFoundation(
        proj.uMin,
        proj.uMax,
        proj.groundElev,
        firstFloorElev,
        elevToSvgY,
        foundCol,
        lineCol,
        groundCol,
      ),
      renderWallsAndOpenings(
        proj.walls,
        proj.openings,
        elevToSvgY,
        wallCol,
        lineCol,
        frameCol,
        glassCol,
      ),
      renderRoof(proj.roof, elevToSvgY, roofCol, wallCol, lineCol, hasChimney),
    ];

    if (shouldShowLevels) {
      layers.push(
        renderLevelLines(
          proj.levels,
          proj.uMin,
          proj.uMax,
          elevToSvgY,
          lineCol,
        ),
      );
    }
    if (shouldShowDims) {
      layers.push(
        renderHeightDimensions(
          proj.groundElev,
          proj.eavesElev,
          proj.ridgeElev,
          proj.uMax,
          elevToSvgY,
          lineCol,
        ),
      );
      layers.push(
        renderWidthDimension(
          proj.uMin,
          proj.uMax,
          proj.groundElev,
          elevToSvgY,
          lineCol,
        ),
      );
    }
    layers.push(
      renderTitleBlock(
        side,
        proj.uMin,
        proj.uMax,
        proj.groundElev,
        elevToSvgY,
        scale,
        lineCol,
      ),
    );
    layers.push("</svg>");

    return layers.join("\n");
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Unknown rendering failure";
    return renderErrorSvg(msg);
  }
}

export function renderAllElevations(
  model: BuildingModel,
  opts: RenderElevationOptions = {},
): Record<ElevationSide, string> {
  return {
    south: renderElevation(model, "south", opts),
    north: renderElevation(model, "north", opts),
    east: renderElevation(model, "east", opts),
    west: renderElevation(model, "west", opts),
  };
}
