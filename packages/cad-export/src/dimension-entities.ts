import { type Floor } from "@aihome/bdm";
import { TEXT_HEIGHT_DIMENSION_MM } from "./constants.js";
import { type DxfWriter } from "./dxf-writer.js";
import { type DxfVersion } from "./types.js";

export function writeDimensionEntities(
  writer: DxfWriter,
  floor: Floor,
  version: DxfVersion,
): void {
  const lvl = floor.level.toString();
  const layer = `F${lvl}-DIM`;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const wall of floor.walls) {
    if (wall.a.x < minX) minX = wall.a.x;
    if (wall.a.y < minY) minY = wall.a.y;
    if (wall.a.x > maxX) maxX = wall.a.x;
    if (wall.a.y > maxY) maxY = wall.a.y;
    if (wall.b.x < minX) minX = wall.b.x;
    if (wall.b.y < minY) minY = wall.b.y;
    if (wall.b.x > maxX) maxX = wall.b.x;
    if (wall.b.y > maxY) maxY = wall.b.y;
  }

  for (const room of floor.rooms) {
    for (const pt of room.polygon) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }
  }

  if (minX === Infinity || minX >= maxX || minY >= maxY) return;

  const widthMm = Math.round(maxX - minX);
  const depthMm = Math.round(maxY - minY);

  const dimY = minY - 800;
  writer.writeLine(layer, minX, minY - 200, minX, minY - 1000, version);
  writer.writeLine(layer, maxX, minY - 200, maxX, minY - 1000, version);
  writer.writeLine(layer, minX, dimY, maxX, dimY, version);
  writer.writeLine(layer, minX - 70, dimY - 70, minX + 70, dimY + 70, version);
  writer.writeLine(layer, maxX - 70, dimY - 70, maxX + 70, dimY + 70, version);
  const midX = Math.round((minX + maxX) / 2);
  writer.writeText(
    layer,
    widthMm.toString(),
    midX,
    dimY + 150,
    TEXT_HEIGHT_DIMENSION_MM,
    0,
    1,
    2,
    version,
  );

  const dimX = minX - 800;
  writer.writeLine(layer, minX - 200, minY, minX - 1000, minY, version);
  writer.writeLine(layer, minX - 200, maxY, minX - 1000, maxY, version);
  writer.writeLine(layer, dimX, minY, dimX, maxY, version);
  writer.writeLine(layer, dimX - 70, minY - 70, dimX + 70, minY + 70, version);
  writer.writeLine(layer, dimX - 70, maxY - 70, dimX + 70, maxY + 70, version);
  const midY = Math.round((minY + maxY) / 2);
  writer.writeText(
    layer,
    depthMm.toString(),
    dimX - 150,
    midY,
    TEXT_HEIGHT_DIMENSION_MM,
    90,
    1,
    2,
    version,
  );
}
