import { type ProjectedOpening } from "./types.js";
import { svgLine, svgRect } from "./svg-utils.js";
import { DEFAULT_COLORS, STROKE_WIDTHS } from "./constants.js";

export function renderOpening(
  op: ProjectedOpening,
  elevToSvgY: (elev: number) => number,
  frameColor = DEFAULT_COLORS.frame,
  glassColor = DEFAULT_COLORS.glass,
  lineColor = DEFAULT_COLORS.line,
): string {
  const parts: string[] = [];
  const w = Math.max(100, op.uMax - op.uMin);
  const topSvgY = elevToSvgY(op.topElev);
  const botSvgY = elevToSvgY(op.sillElev);
  const h = Math.max(100, botSvgY - topSvgY);
  const isWin = op.kind === "window" || op.kind === "largeWindow";

  if (isWin) {
    parts.push(
      svgRect(
        op.uMin,
        topSvgY,
        w,
        h,
        frameColor,
        lineColor,
        STROKE_WIDTHS.medium,
      ),
    );
    const frameThick = 45;
    if (w > frameThick * 2 && h > frameThick * 2) {
      parts.push(
        svgRect(
          op.uMin + frameThick,
          topSvgY + frameThick,
          w - frameThick * 2,
          h - frameThick * 2,
          glassColor,
          lineColor,
          STROKE_WIDTHS.light,
        ),
      );
    }
    const midX = op.uMin + w / 2;
    const midY = topSvgY + h / 2;
    parts.push(
      svgLine(midX, topSvgY, midX, botSvgY, frameColor, STROKE_WIDTHS.mullion),
    );
    parts.push(
      svgLine(op.uMin, midY, op.uMax, midY, frameColor, STROKE_WIDTHS.mullion),
    );
    parts.push(
      svgLine(
        op.uMin - 25,
        botSvgY,
        op.uMax + 25,
        botSvgY,
        lineColor,
        STROKE_WIDTHS.medium,
      ),
    );
    return parts.join("\n");
  }

  if (op.kind === "entrance") {
    parts.push(
      svgRect(
        op.uMin,
        topSvgY,
        w,
        h,
        "#475569",
        lineColor,
        STROKE_WIDTHS.heavy,
      ),
    );
    const frameThick = 50;
    if (w > frameThick * 2 && h > frameThick * 2) {
      parts.push(
        svgRect(
          op.uMin + frameThick,
          topSvgY + frameThick,
          w - frameThick * 2,
          h - frameThick * 2,
          "#e2e8f0",
          lineColor,
          STROKE_WIDTHS.medium,
        ),
      );
    }
    const handleX = op.uMin + w - 100;
    const handleY1 = botSvgY - 1100;
    const handleY2 = botSvgY - 800;
    parts.push(
      svgLine(
        handleX,
        handleY1,
        handleX,
        handleY2,
        "#0f172a",
        STROKE_WIDTHS.heavy,
      ),
    );
    return parts.join("\n");
  }

  parts.push(
    svgRect(op.uMin, topSvgY, w, h, "#64748b", lineColor, STROKE_WIDTHS.medium),
  );
  const frameThick = 40;
  if (w > frameThick * 2 && h > frameThick * 2) {
    parts.push(
      svgRect(
        op.uMin + frameThick,
        topSvgY + frameThick,
        w - frameThick * 2,
        h - frameThick * 2,
        "#f1f5f9",
        lineColor,
        STROKE_WIDTHS.light,
      ),
    );
  }
  const knobX = op.uMin + w - 80;
  const knobY = botSvgY - 950;
  parts.push(
    svgLine(
      knobX,
      knobY - 30,
      knobX,
      knobY + 30,
      "#0f172a",
      STROKE_WIDTHS.heavy,
    ),
  );
  return parts.join("\n");
}
