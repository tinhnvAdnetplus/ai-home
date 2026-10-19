import { type Floor, type Wall } from "@aihome/bdm";
import { type DxfWriter } from "./dxf-writer.js";
import { writeDoor, writeSlidingDoor } from "./opening-door.js";
import { writeWindow } from "./opening-window.js";
import { type DxfVersion, type Point2D } from "./types.js";

export function writeOpeningEntities(
  writer: DxfWriter,
  floor: Floor,
  version: DxfVersion,
): void {
  const lvl = floor.level.toString();
  const doorLayer = `F${lvl}-DOOR`;
  const winLayer = `F${lvl}-WINDOW`;
  const wallMap = new Map<string, Wall>(floor.walls.map((w) => [w.id, w]));

  for (const op of floor.openings) {
    const wall = wallMap.get(op.wallId);
    if (!wall) continue;

    const dx = wall.b.x - wall.a.x;
    const dy = wall.b.y - wall.a.y;
    const len = Math.hypot(dx, dy);
    if (len < 1) continue;

    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    const halfThick = wall.thicknessMm / 2;

    const p1: Point2D = {
      x: Math.round(wall.a.x + ux * op.offsetMm),
      y: Math.round(wall.a.y + uy * op.offsetMm),
    };
    const p2: Point2D = {
      x: Math.round(wall.a.x + ux * (op.offsetMm + op.widthMm)),
      y: Math.round(wall.a.y + uy * (op.offsetMm + op.widthMm)),
    };

    if (op.kind === "door" || op.kind === "entrance") {
      writeDoor(writer, doorLayer, p1, p2, ux, uy, nx, ny, op.widthMm, version);
    } else if (op.kind === "slidingDoor") {
      writeSlidingDoor(
        writer,
        doorLayer,
        p1,
        p2,
        ux,
        uy,
        nx,
        ny,
        op.widthMm,
        halfThick,
        version,
      );
    } else {
      const isLarge = op.kind === "largeWindow";
      writeWindow(
        writer,
        winLayer,
        p1,
        p2,
        nx,
        ny,
        halfThick,
        isLarge,
        version,
      );
    }
  }
}
