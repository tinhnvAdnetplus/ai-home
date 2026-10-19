import { type Floor, type Polygon } from "@aihome/bdm";
import {
  TEXT_HEIGHT_ROOM_AREA_MM,
  TEXT_HEIGHT_ROOM_NAME_MM,
} from "./constants.js";
import { type DxfWriter } from "./dxf-writer.js";
import { encodeDxfText } from "./encoding.js";
import { type DxfEncoding, type DxfVersion, type Point2D } from "./types.js";

function computePolygonCentroid(polygon: Polygon): Point2D {
  if (polygon.length === 0) {
    return { x: 0, y: 0 };
  }
  let sumX = 0;
  let sumY = 0;
  for (const pt of polygon) {
    sumX += pt.x;
    sumY += pt.y;
  }
  return {
    x: Math.round(sumX / polygon.length),
    y: Math.round(sumY / polygon.length),
  };
}

export function writeRoomEntities(
  writer: DxfWriter,
  floor: Floor,
  version: DxfVersion,
  encoding: DxfEncoding,
): void {
  const lvl = floor.level.toString();
  const roomLayer = `F${lvl}-ROOM`;
  const textLayer = `F${lvl}-TEXT`;

  for (const room of floor.rooms) {
    if (room.polygon.length > 0) {
      writer.writePolyline(roomLayer, room.polygon, true, version);
    }

    const center = computePolygonCentroid(room.polygon);
    const nameText = encodeDxfText(room.name, encoding);
    writer.writeText(
      textLayer,
      nameText,
      center.x,
      center.y + 120,
      TEXT_HEIGHT_ROOM_NAME_MM,
      0,
      1,
      2,
      version,
    );

    const areaStr = `${room.areaM2.toFixed(1)} m²`;
    const areaText = encodeDxfText(areaStr, encoding);
    writer.writeText(
      textLayer,
      areaText,
      center.x,
      center.y - 120,
      TEXT_HEIGHT_ROOM_AREA_MM,
      0,
      1,
      2,
      version,
    );
  }
}
