import { type ElevationSide } from "./types.js";
import { svgLine, svgText } from "./svg-utils.js";
import {
  DEFAULT_COLORS,
  DEFAULT_SCALE,
  SIDE_TITLES,
  STROKE_WIDTHS,
  TEXT_SIZES,
} from "./constants.js";

export function renderTitleBlock(
  side: ElevationSide,
  uMin: number,
  uMax: number,
  groundElev: number,
  elevToSvgY: (elev: number) => number,
  scale = DEFAULT_SCALE,
  lineColor = DEFAULT_COLORS.line,
): string {
  const parts: string[] = [];
  const glY = elevToSvgY(groundElev);
  const titleY = glY + 1450;
  const midX = (uMin + uMax) / 2;
  const titleText = SIDE_TITLES[side];
  const scaleText = `SCALE 1:${scale.toString()}`;

  parts.push(
    svgText(
      midX,
      titleY,
      titleText,
      TEXT_SIZES.title,
      "middle",
      lineColor,
      true,
    ),
  );
  parts.push(
    svgLine(
      midX - 700,
      titleY + 60,
      midX + 700,
      titleY + 60,
      lineColor,
      STROKE_WIDTHS.heavy,
    ),
  );
  parts.push(
    svgLine(
      midX - 700,
      titleY + 90,
      midX + 700,
      titleY + 90,
      lineColor,
      STROKE_WIDTHS.light,
    ),
  );
  parts.push(
    svgText(
      midX,
      titleY + 230,
      scaleText,
      TEXT_SIZES.subtitle,
      "middle",
      "#475569",
      false,
    ),
  );

  return parts.join("\n");
}
