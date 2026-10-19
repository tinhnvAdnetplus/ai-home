import { type DxfWriter } from "./dxf-writer.js";
import { type DxfVersion, type Point2D } from "./types.js";

export function writeWindow(
  writer: DxfWriter,
  layer: string,
  p1: Point2D,
  p2: Point2D,
  nx: number,
  ny: number,
  halfThick: number,
  isLarge: boolean,
  version: DxfVersion,
): void {
  writer.writeLine(
    layer,
    p1.x - nx * halfThick,
    p1.y - ny * halfThick,
    p1.x + nx * halfThick,
    p1.y + ny * halfThick,
    version,
  );
  writer.writeLine(
    layer,
    p2.x - nx * halfThick,
    p2.y - ny * halfThick,
    p2.x + nx * halfThick,
    p2.y + ny * halfThick,
    version,
  );
  writer.writeLine(
    layer,
    p1.x + nx * halfThick,
    p1.y + ny * halfThick,
    p2.x + nx * halfThick,
    p2.y + ny * halfThick,
    version,
  );
  writer.writeLine(
    layer,
    p1.x - nx * halfThick,
    p1.y - ny * halfThick,
    p2.x - nx * halfThick,
    p2.y - ny * halfThick,
    version,
  );
  writer.writeLine(layer, p1.x, p1.y, p2.x, p2.y, version);

  if (isLarge) {
    writer.writeLine(
      layer,
      p1.x + nx * 25,
      p1.y + ny * 25,
      p2.x + nx * 25,
      p2.y + ny * 25,
      version,
    );
    writer.writeLine(
      layer,
      p1.x - nx * 25,
      p1.y - ny * 25,
      p2.x - nx * 25,
      p2.y - ny * 25,
      version,
    );
  }
}
