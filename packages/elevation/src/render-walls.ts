import { type ProjectedOpening, type ProjectedWall } from "./types.js";
import { svgRect } from "./svg-utils.js";
import { DEFAULT_COLORS, STROKE_WIDTHS } from "./constants.js";
import { renderOpening } from "./render-openings.js";

export function renderWallsAndOpenings(
  walls: readonly ProjectedWall[],
  openings: readonly ProjectedOpening[],
  elevToSvgY: (elev: number) => number,
  wallColor = DEFAULT_COLORS.wall,
  lineColor = DEFAULT_COLORS.line,
  frameColor = DEFAULT_COLORS.frame,
  glassColor = DEFAULT_COLORS.glass,
): string {
  const parts: string[] = [];

  const sortedWalls = [...walls].sort((a, b) => b.depth - a.depth);

  for (const wall of sortedWalls) {
    const topSvgY = elevToSvgY(wall.topElev);
    const botSvgY = elevToSvgY(wall.botElev);
    const w = Math.max(10, wall.uMax - wall.uMin);
    const h = Math.max(10, botSvgY - topSvgY);

    parts.push(
      svgRect(
        wall.uMin,
        topSvgY,
        w,
        h,
        wallColor,
        lineColor,
        STROKE_WIDTHS.heavy,
      ),
    );

    const wallOpenings = openings.filter((op) => op.wallId === wall.wallId);

    for (const op of wallOpenings) {
      parts.push(
        renderOpening(op, elevToSvgY, frameColor, glassColor, lineColor),
      );
    }
  }

  return parts.join("\n");
}
