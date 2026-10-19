import { TEXT_HEIGHT_NOTE_MM } from "./constants.js";
import { type DxfWriter } from "./dxf-writer.js";
import { type DxfVersion, type Point2D } from "./types.js";

/**
 * `angleDeg` turns the arrow clockwise from "up" (the plan shows the road at the bottom,
 * so north is up only for a south road; see northArrowAngleDeg in @aihome/bdm).
 */
export function writeNorthArrow(
  writer: DxfWriter,
  cx: number,
  cy: number,
  scale: number,
  version: DxfVersion,
  angleDeg = 0,
): void {
  const layer = "TITLE";
  const r = Math.round(5 * scale);
  writer.writeArc(layer, cx, cy, r, 0, 360, version);

  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  // (dx, dy) is an offset for the arrow pointing up; DXF y grows upwards, so clockwise is -angle
  const at = (dx: number, dy: number): Point2D => ({
    x: Math.round(cx + dx * cos + dy * sin),
    y: Math.round(cy - dx * sin + dy * cos),
  });

  const top = at(0, r);
  const bot = at(0, -r);
  writer.writeLine(layer, bot.x, bot.y, top.x, top.y, version);

  const headBase = Math.round(r * 0.4);
  const headHalfW = Math.round(r * 0.25);
  const headPts: Point2D[] = [
    top,
    at(-headHalfW, headBase),
    at(headHalfW, headBase),
  ];
  writer.writePolyline(layer, headPts, true, version);

  const label = at(0, r + Math.round(3 * scale));
  writer.writeText(
    layer,
    "N",
    label.x,
    label.y,
    TEXT_HEIGHT_NOTE_MM,
    0,
    1,
    2,
    version,
  );
}
