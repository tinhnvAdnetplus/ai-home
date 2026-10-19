import { svgLine, svgText } from "./svg-utils.js";
import { DEFAULT_COLORS, STROKE_WIDTHS, TEXT_SIZES } from "./constants.js";

function formatMm(mm: number): string {
  return Math.round(mm).toLocaleString("en-US");
}

function renderTick(x: number, y: number, color: string): string {
  return svgLine(x - 40, y + 40, x + 40, y - 40, color, STROKE_WIDTHS.medium);
}

export function renderHeightDimensions(
  groundElev: number,
  eavesElev: number,
  ridgeElev: number,
  uMax: number,
  elevToSvgY: (elev: number) => number,
  lineColor = DEFAULT_COLORS.line,
): string {
  const parts: string[] = [];
  const glY = elevToSvgY(groundElev);
  const eavesY = elevToSvgY(eavesElev);
  const ridgeY = elevToSvgY(ridgeElev);
  const chainX = uMax + 800;
  const totalX = uMax + 1600;

  parts.push(
    svgLine(uMax + 100, glY, totalX + 200, glY, "#94a3b8", STROKE_WIDTHS.light),
  );
  parts.push(
    svgLine(
      uMax + 100,
      eavesY,
      totalX + 200,
      eavesY,
      "#94a3b8",
      STROKE_WIDTHS.light,
    ),
  );
  parts.push(
    svgLine(
      uMax + 100,
      ridgeY,
      totalX + 200,
      ridgeY,
      "#94a3b8",
      STROKE_WIDTHS.light,
    ),
  );

  parts.push(
    svgLine(chainX, glY, chainX, ridgeY, lineColor, STROKE_WIDTHS.light),
  );
  parts.push(renderTick(chainX, glY, lineColor));
  parts.push(renderTick(chainX, eavesY, lineColor));
  parts.push(renderTick(chainX, ridgeY, lineColor));

  const eaveDist = eavesElev - groundElev;
  const ridgeDist = ridgeElev - eavesElev;
  parts.push(
    svgText(
      chainX + 50,
      (glY + eavesY) / 2 + 50,
      formatMm(eaveDist),
      TEXT_SIZES.dimension,
      "start",
      lineColor,
    ),
  );
  parts.push(
    svgText(
      chainX + 50,
      (eavesY + ridgeY) / 2 + 50,
      formatMm(ridgeDist),
      TEXT_SIZES.dimension,
      "start",
      lineColor,
    ),
  );

  parts.push(
    svgLine(totalX, glY, totalX, ridgeY, lineColor, STROKE_WIDTHS.light),
  );
  parts.push(renderTick(totalX, glY, lineColor));
  parts.push(renderTick(totalX, ridgeY, lineColor));
  const totalDist = ridgeElev - groundElev;
  parts.push(
    svgText(
      totalX + 50,
      (glY + ridgeY) / 2 + 50,
      formatMm(totalDist),
      TEXT_SIZES.dimension,
      "start",
      lineColor,
      true,
    ),
  );

  return parts.join("\n");
}

export function renderWidthDimension(
  uMin: number,
  uMax: number,
  groundElev: number,
  elevToSvgY: (elev: number) => number,
  lineColor = DEFAULT_COLORS.line,
): string {
  const parts: string[] = [];
  const glY = elevToSvgY(groundElev);
  const dimY = glY + 800;

  parts.push(
    svgLine(uMin, glY + 100, uMin, dimY + 150, "#94a3b8", STROKE_WIDTHS.light),
  );
  parts.push(
    svgLine(uMax, glY + 100, uMax, dimY + 150, "#94a3b8", STROKE_WIDTHS.light),
  );
  parts.push(svgLine(uMin, dimY, uMax, dimY, lineColor, STROKE_WIDTHS.light));
  parts.push(renderTick(uMin, dimY, lineColor));
  parts.push(renderTick(uMax, dimY, lineColor));

  const widthMm = uMax - uMin;
  parts.push(
    svgText(
      (uMin + uMax) / 2,
      dimY - 40,
      formatMm(widthMm),
      TEXT_SIZES.dimension,
      "middle",
      lineColor,
      true,
    ),
  );

  return parts.join("\n");
}
