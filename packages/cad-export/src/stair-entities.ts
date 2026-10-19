import { type Floor } from "@aihome/bdm";
import { TEXT_HEIGHT_NOTE_MM } from "./constants.js";
import { type DxfWriter } from "./dxf-writer.js";
import { type DxfVersion } from "./types.js";

export function writeStairEntities(
  writer: DxfWriter,
  floor: Floor,
  version: DxfVersion,
): void {
  const lvl = floor.level.toString();
  const layer = `F${lvl}-STAIR`;

  for (const stair of floor.stairs) {
    if (stair.polygon.length > 0) {
      writer.writePolyline(layer, stair.polygon, true, version);
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const pt of stair.polygon) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }

    if (minX >= maxX || minY >= maxY) continue;

    const width = maxX - minX;
    const height = maxY - minY;
    const steps = Math.max(6, Math.min(20, stair.steps));
    const midX = Math.round((minX + maxX) / 2);
    const midY = Math.round((minY + maxY) / 2);

    if (height >= width) {
      const dy = height / steps;
      for (let i = 1; i < steps; i += 1) {
        const y = Math.round(minY + i * dy);
        writer.writeLine(layer, minX, y, maxX, y, version);
      }
      writer.writeLine(
        layer,
        midX,
        Math.round(minY + dy),
        midX,
        Math.round(maxY - dy),
        version,
      );
      writer.writeLine(
        layer,
        midX,
        Math.round(maxY - dy),
        midX - 100,
        Math.round(maxY - dy - 150),
        version,
      );
      writer.writeLine(
        layer,
        midX,
        Math.round(maxY - dy),
        midX + 100,
        Math.round(maxY - dy - 150),
        version,
      );
      writer.writeText(
        layer,
        "UP",
        midX,
        Math.round(minY + dy * 0.5),
        TEXT_HEIGHT_NOTE_MM,
        0,
        1,
        2,
        version,
      );
    } else {
      const dx = width / steps;
      for (let i = 1; i < steps; i += 1) {
        const x = Math.round(minX + i * dx);
        writer.writeLine(layer, x, minY, x, maxY, version);
      }
      writer.writeLine(
        layer,
        Math.round(minX + dx),
        midY,
        Math.round(maxX - dx),
        midY,
        version,
      );
      writer.writeLine(
        layer,
        Math.round(maxX - dx),
        midY,
        Math.round(maxX - dx - 150),
        midY - 100,
        version,
      );
      writer.writeLine(
        layer,
        Math.round(maxX - dx),
        midY,
        Math.round(maxX - dx - 150),
        midY + 100,
        version,
      );
      writer.writeText(
        layer,
        "UP",
        Math.round(minX + dx * 0.5),
        midY,
        TEXT_HEIGHT_NOTE_MM,
        0,
        1,
        2,
        version,
      );
    }
  }
}
