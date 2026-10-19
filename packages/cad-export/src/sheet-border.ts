import { DEFAULT_SCALE, PAPER_DIMENSIONS_MM } from "./constants.js";
import { type DxfWriter } from "./dxf-writer.js";
import {
  type BoundingBox2D,
  type DxfVersion,
  type ExportDxfOptions,
  type Point2D,
} from "./types.js";

export type SheetInnerBox = {
  readonly ix0: number;
  readonly iy0: number;
  readonly ix1: number;
  readonly iy1: number;
  readonly scale: number;
};

export function writeSheetBorder(
  writer: DxfWriter,
  bounds: BoundingBox2D,
  options: ExportDxfOptions | undefined,
  version: DxfVersion,
): SheetInnerBox {
  const layer = "TITLE";
  const paperSize = options?.paperSize ?? "A3";
  const scale = options?.scale ?? DEFAULT_SCALE;
  const paper = PAPER_DIMENSIONS_MM[paperSize];

  const sheetWMm = paper.widthMm * scale;
  const sheetHMm = paper.heightMm * scale;
  const marginMm = 10 * scale;

  const midX = (bounds.minX + bounds.maxX) / 2;
  const midY = (bounds.minY + bounds.maxY) / 2;

  const x0 = Math.round(midX - sheetWMm / 2);
  const y0 = Math.round(midY - sheetHMm / 2);
  const x1 = x0 + sheetWMm;
  const y1 = y0 + sheetHMm;

  const ix0 = x0 + marginMm;
  const iy0 = y0 + marginMm;
  const ix1 = x1 - marginMm;
  const iy1 = y1 - marginMm;

  const outerPts: Point2D[] = [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];
  writer.writePolyline(layer, outerPts, true, version);

  const innerPts: Point2D[] = [
    { x: ix0, y: iy0 },
    { x: ix1, y: iy0 },
    { x: ix1, y: iy1 },
    { x: ix0, y: iy1 },
  ];
  writer.writePolyline(layer, innerPts, true, version);

  return { ix0, iy0, ix1, iy1, scale };
}
