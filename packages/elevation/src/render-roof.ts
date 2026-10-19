import { type ProjectedRoof } from "./types.js";
import { svgLine, svgPolygon, svgRect } from "./svg-utils.js";
import { DEFAULT_COLORS, STROKE_WIDTHS } from "./constants.js";

export function renderRoof(
  roof: ProjectedRoof | null,
  elevToSvgY: (elev: number) => number,
  roofColor = DEFAULT_COLORS.roof,
  wallColor = DEFAULT_COLORS.wall,
  lineColor = DEFAULT_COLORS.line,
  hasChimney = false,
): string {
  if (!roof) return "";
  const parts: string[] = [];

  if (roof.lowerRoofs) {
    for (const lr of roof.lowerRoofs) {
      const svgLrPts = lr.map((p) => ({ x: p.x, y: elevToSvgY(p.y) }));
      parts.push(
        svgPolygon(svgLrPts, roofColor, lineColor, STROKE_WIDTHS.medium),
      );
    }
  }

  if (roof.gablePoints && roof.gablePoints.length > 0) {
    const svgGablePts = roof.gablePoints.map((p) => ({
      x: p.x,
      y: elevToSvgY(p.y),
    }));
    parts.push(
      svgPolygon(svgGablePts, wallColor, lineColor, STROKE_WIDTHS.medium),
    );
  }

  const svgRoofPts = roof.points.map((p) => ({
    x: p.x,
    y: elevToSvgY(p.y),
  }));
  parts.push(svgPolygon(svgRoofPts, roofColor, lineColor, STROKE_WIDTHS.heavy));

  const eaveSvgY = elevToSvgY(roof.eaveElev);
  const ridgeSvgY = elevToSvgY(roof.ridgeElev);

  if (roof.kind === "gabled" && !roof.gablePoints) {
    const fasciaH = 150;
    parts.push(
      svgRect(
        roof.uMin,
        eaveSvgY,
        roof.uMax - roof.uMin,
        fasciaH,
        "#1e293b",
        lineColor,
        STROKE_WIDTHS.medium,
      ),
    );
    parts.push(
      svgLine(
        roof.uMin,
        ridgeSvgY,
        roof.uMax,
        ridgeSvgY,
        lineColor,
        STROKE_WIDTHS.heavy,
      ),
    );
  }

  if (hasChimney) {
    const chX = roof.ridgeU + 600;
    const chW = 500;
    const chTopSvgY = ridgeSvgY - 700;
    const chBotSvgY = ridgeSvgY + 200;
    parts.push(
      svgRect(
        chX,
        chTopSvgY,
        chW,
        chBotSvgY - chTopSvgY,
        "#991b1b",
        lineColor,
        STROKE_WIDTHS.medium,
      ),
    );
    parts.push(
      svgRect(
        chX - 40,
        chTopSvgY - 60,
        chW + 80,
        60,
        "#1e293b",
        lineColor,
        STROKE_WIDTHS.medium,
      ),
    );
  }

  return parts.join("\n");
}
