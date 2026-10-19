import { type ElevationLevelLine } from "./types.js";
import { svgLine, svgText } from "./svg-utils.js";
import { DEFAULT_COLORS, STROKE_WIDTHS, TEXT_SIZES } from "./constants.js";

export function renderLevelLines(
  levels: readonly ElevationLevelLine[],
  uMin: number,
  uMax: number,
  elevToSvgY: (elev: number) => number,
  lineColor = DEFAULT_COLORS.line,
): string {
  const parts: string[] = [];
  for (const lvl of levels) {
    if (lvl.label === "GL") continue;
    const y = elevToSvgY(lvl.elevationMm);
    parts.push(
      svgLine(
        uMin - 600,
        y,
        uMax + 300,
        y,
        "#94a3b8",
        STROKE_WIDTHS.light,
        "16 8 4 8",
      ),
    );
    parts.push(
      svgText(
        uMin - 650,
        y + 45,
        `▼ ${lvl.label}`,
        TEXT_SIZES.level,
        "end",
        lineColor,
        true,
      ),
    );
  }
  return parts.join("\n");
}
