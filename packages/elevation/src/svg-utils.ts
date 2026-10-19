import { type Point2D } from "./types.js";

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function formatNum(val: number): string {
  return (Math.round(val * 10) / 10).toString();
}

export function svgRect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke: string,
  strokeWidth: number,
): string {
  return `<rect x="${formatNum(x)}" y="${formatNum(y)}" width="${formatNum(width)}" height="${formatNum(height)}" fill="${fill}" stroke="${stroke}" stroke-width="${formatNum(strokeWidth)}" />`;
}

export function svgLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: string,
  strokeWidth: number,
  dashArray?: string,
): string {
  const dashAttr = dashArray ? ` stroke-dasharray="${dashArray}"` : "";
  return `<line x1="${formatNum(x1)}" y1="${formatNum(y1)}" x2="${formatNum(x2)}" y2="${formatNum(y2)}" stroke="${stroke}" stroke-width="${formatNum(strokeWidth)}"${dashAttr} />`;
}

export function svgPolygon(
  points: readonly Point2D[],
  fill: string,
  stroke: string,
  strokeWidth: number,
): string {
  const ptsStr = points
    .map((p) => `${formatNum(p.x)},${formatNum(p.y)}`)
    .join(" ");
  return `<polygon points="${ptsStr}" fill="${fill}" stroke="${stroke}" stroke-width="${formatNum(strokeWidth)}" />`;
}

export function svgText(
  x: number,
  y: number,
  text: string,
  fontSize: number,
  anchor: "start" | "middle" | "end" = "middle",
  fill = "#0f172a",
  isBold = false,
): string {
  const weight = isBold ? ' font-weight="bold"' : "";
  return `<text x="${formatNum(x)}" y="${formatNum(y)}" font-family="'Noto Sans JP', sans-serif" font-size="${formatNum(fontSize)}" text-anchor="${anchor}" fill="${fill}"${weight}>${escapeXml(text)}</text>`;
}

export function renderErrorSvg(message: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="1000" height="600">
  <rect width="1000" height="600" fill="#fef2f2" />
  <text x="500" y="300" font-family="'Noto Sans JP', sans-serif" font-size="28" text-anchor="middle" fill="#dc2626">Error rendering elevation: ${escapeXml(message)}</text>
</svg>`;
}
