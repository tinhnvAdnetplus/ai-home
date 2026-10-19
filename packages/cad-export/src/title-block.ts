import { northArrowAngleDeg, type BuildingModel } from "@aihome/bdm";
import { TEXT_HEIGHT_NOTE_MM, TEXT_HEIGHT_TITLE_MM } from "./constants.js";
import { type DxfWriter } from "./dxf-writer.js";
import { encodeDxfText } from "./encoding.js";
import { writeNorthArrow } from "./north-arrow.js";
import { writeScaleBar } from "./scale-bar.js";
import { writeSheetBorder } from "./sheet-border.js";
import {
  type BoundingBox2D,
  type DxfEncoding,
  type DxfVersion,
  type ExportDxfOptions,
  type Point2D,
} from "./types.js";

export function writeTitleBlock(
  writer: DxfWriter,
  model: BuildingModel,
  bounds: BoundingBox2D,
  options: ExportDxfOptions | undefined,
  version: DxfVersion,
  encoding: DxfEncoding,
): void {
  const layer = "TITLE";
  const sheet = writeSheetBorder(writer, bounds, options, version);
  const { ix0, iy0, ix1, iy1, scale } = sheet;

  const tbWidthMm = Math.round(150 * scale);
  const tbHeightMm = Math.round(40 * scale);
  const tbx0 = ix1 - tbWidthMm;
  const tby0 = iy0;

  const tbPts: Point2D[] = [
    { x: tbx0, y: tby0 },
    { x: ix1, y: tby0 },
    { x: ix1, y: tby0 + tbHeightMm },
    { x: tbx0, y: tby0 + tbHeightMm },
  ];
  writer.writePolyline(layer, tbPts, true, version);

  const rowH = Math.round(tbHeightMm / 3);
  writer.writeLine(layer, tbx0, tby0 + rowH, ix1, tby0 + rowH, version);
  writer.writeLine(layer, tbx0, tby0 + rowH * 2, ix1, tby0 + rowH * 2, version);

  const info = options?.titleBlockInfo;
  const projName = encodeDxfText(
    info?.projectName ?? "AI HOME PROJECT",
    encoding,
  );
  const platformName = encodeDxfText("AI HOME PLATFORM", encoding);
  const dwgTitle = encodeDxfText(info?.drawingTitle ?? "FLOOR PLAN", encoding);
  const authorStr = encodeDxfText(
    info?.architect ?? model.meta.generator,
    encoding,
  );
  const scaleStr = `SCALE: 1/${scale.toString()}`;
  const dateStr = encodeDxfText(
    `DATE: ${info?.date ?? "2026-10-12"}`,
    encoding,
  );
  const sheetStr = encodeDxfText(
    `SHEET: ${info?.sheetNumber ?? "A-01"}`,
    encoding,
  );

  writer.writeText(
    layer,
    projName,
    tbx0 + 400,
    tby0 + rowH * 2 + 350,
    TEXT_HEIGHT_TITLE_MM,
    0,
    0,
    0,
    version,
  );
  writer.writeText(
    layer,
    platformName,
    tbx0 + Math.round(tbWidthMm * 0.55),
    tby0 + rowH * 2 + 350,
    TEXT_HEIGHT_NOTE_MM,
    0,
    0,
    0,
    version,
  );
  writer.writeText(
    layer,
    dwgTitle,
    tbx0 + 400,
    tby0 + rowH + 350,
    TEXT_HEIGHT_TITLE_MM,
    0,
    0,
    0,
    version,
  );
  writer.writeText(
    layer,
    authorStr,
    tbx0 + Math.round(tbWidthMm * 0.55),
    tby0 + rowH + 350,
    TEXT_HEIGHT_NOTE_MM,
    0,
    0,
    0,
    version,
  );
  writer.writeText(
    layer,
    scaleStr,
    tbx0 + 400,
    tby0 + 350,
    TEXT_HEIGHT_NOTE_MM,
    0,
    0,
    0,
    version,
  );
  writer.writeText(
    layer,
    dateStr,
    tbx0 + Math.round(tbWidthMm * 0.45),
    tby0 + 350,
    TEXT_HEIGHT_NOTE_MM,
    0,
    0,
    0,
    version,
  );
  writer.writeText(
    layer,
    sheetStr,
    tbx0 + Math.round(tbWidthMm * 0.8),
    tby0 + 350,
    TEXT_HEIGHT_NOTE_MM,
    0,
    0,
    0,
    version,
  );

  writeNorthArrow(
    writer,
    ix1 - 1500,
    iy1 - 1500,
    scale,
    version,
    northArrowAngleDeg(model.site.road.side),
  );
  const scaleBarX = Math.max(ix0 + 500, tbx0 - 6500);
  writeScaleBar(writer, scaleBarX, iy0 + 600, scale, version);
}
