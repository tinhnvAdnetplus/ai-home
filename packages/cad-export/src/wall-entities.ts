import { type Floor } from "@aihome/bdm";
import { type DxfWriter } from "./dxf-writer.js";
import { type DxfVersion, type Point2D } from "./types.js";

export function writeWallEntities(
  writer: DxfWriter,
  floor: Floor,
  version: DxfVersion,
): void {
  const lvl = floor.level.toString();
  const extLayer = `F${lvl}-WALL-EXT`;
  const intLayer = `F${lvl}-WALL-INT`;

  for (const wall of floor.walls) {
    const dx = wall.b.x - wall.a.x;
    const dy = wall.b.y - wall.a.y;
    const length = Math.hypot(dx, dy);
    if (length < 1) {
      continue;
    }

    const nx = -dy / length;
    const ny = dx / length;
    const halfThick = wall.thicknessMm / 2;

    const p1: Point2D = {
      x: Math.round(wall.a.x + nx * halfThick),
      y: Math.round(wall.a.y + ny * halfThick),
    };
    const p2: Point2D = {
      x: Math.round(wall.b.x + nx * halfThick),
      y: Math.round(wall.b.y + ny * halfThick),
    };
    const p3: Point2D = {
      x: Math.round(wall.b.x - nx * halfThick),
      y: Math.round(wall.b.y - ny * halfThick),
    };
    const p4: Point2D = {
      x: Math.round(wall.a.x - nx * halfThick),
      y: Math.round(wall.a.y - ny * halfThick),
    };

    const layer = wall.kind === "exterior" ? extLayer : intLayer;
    writer.writePolyline(layer, [p1, p2, p3, p4], true, version);
  }
}
