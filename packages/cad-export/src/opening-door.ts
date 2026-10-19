import { type DxfWriter } from "./dxf-writer.js";
import { type DxfVersion, type Point2D } from "./types.js";

function normalizeDeg(deg: number): number {
  const wrapped = deg % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

export function writeDoor(
  writer: DxfWriter,
  layer: string,
  p1: Point2D,
  p2: Point2D,
  ux: number,
  uy: number,
  nx: number,
  ny: number,
  width: number,
  version: DxfVersion,
): void {
  const leaf: Point2D = {
    x: Math.round(p1.x + nx * width),
    y: Math.round(p1.y + ny * width),
  };
  writer.writeLine(layer, p1.x, p1.y, leaf.x, leaf.y, version);

  const degWall = normalizeDeg(
    Math.round((Math.atan2(uy, ux) * 180) / Math.PI),
  );
  const degNorm = normalizeDeg(
    Math.round((Math.atan2(ny, nx) * 180) / Math.PI),
  );
  const diff = (degNorm - degWall + 360) % 360;

  const startAngle = diff > 0 && diff <= 180 ? degWall : degNorm;
  const endAngle = diff > 0 && diff <= 180 ? degNorm : degWall;

  writer.writeArc(layer, p1.x, p1.y, width, startAngle, endAngle, version);
  writer.writeLine(layer, p1.x, p1.y, p2.x, p2.y, version);
}

export function writeSlidingDoor(
  writer: DxfWriter,
  layer: string,
  p1: Point2D,
  p2: Point2D,
  ux: number,
  uy: number,
  nx: number,
  ny: number,
  width: number,
  halfThick: number,
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

  const mid1X = Math.round(p1.x + ux * width * 0.55 + nx * 20);
  const mid1Y = Math.round(p1.y + uy * width * 0.55 + ny * 20);
  writer.writeLine(
    layer,
    Math.round(p1.x + nx * 20),
    Math.round(p1.y + ny * 20),
    mid1X,
    mid1Y,
    version,
  );

  const mid2X = Math.round(p1.x + ux * width * 0.45 - nx * 20);
  const mid2Y = Math.round(p1.y + uy * width * 0.45 - ny * 20);
  writer.writeLine(
    layer,
    mid2X,
    mid2Y,
    Math.round(p2.x - nx * 20),
    Math.round(p2.y - ny * 20),
    version,
  );
}
