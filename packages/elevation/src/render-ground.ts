import { svgLine, svgRect, svgText } from "./svg-utils.js";
import { DEFAULT_COLORS, STROKE_WIDTHS, TEXT_SIZES } from "./constants.js";

export function renderGroundAndFoundation(
  uMin: number,
  uMax: number,
  groundElev: number,
  firstFloorElev: number,
  elevToSvgY: (elev: number) => number,
  foundationColor = DEFAULT_COLORS.foundation,
  lineColor = DEFAULT_COLORS.line,
  groundColor = DEFAULT_COLORS.ground,
): string {
  const parts: string[] = [];
  const glSvgY = elevToSvgY(groundElev);
  const flSvgY = elevToSvgY(firstFloorElev);
  const spanL = uMin - 1500;
  const spanR = uMax + 1500;

  const fHeight = glSvgY - flSvgY;
  if (fHeight > 0) {
    parts.push(
      svgRect(
        uMin,
        flSvgY,
        uMax - uMin,
        fHeight,
        foundationColor,
        lineColor,
        STROKE_WIDTHS.medium,
      ),
    );
  }

  parts.push(
    svgLine(spanL, glSvgY, spanR, glSvgY, lineColor, STROKE_WIDTHS.heavy),
  );

  const hatchStep = 150;
  const hatchLen = 140;
  for (let x = spanL; x <= spanR; x += hatchStep) {
    parts.push(
      svgLine(
        x,
        glSvgY,
        x - hatchLen * 0.7,
        glSvgY + hatchLen * 0.7,
        groundColor,
        STROKE_WIDTHS.light,
      ),
    );
  }

  parts.push(
    svgText(
      spanL - 60,
      glSvgY + 45,
      "▼ GL",
      TEXT_SIZES.level,
      "end",
      groundColor,
      true,
    ),
  );

  return parts.join("\n");
}
