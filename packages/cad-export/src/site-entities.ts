import { type Site } from "@aihome/bdm";
import { TEXT_HEIGHT_NOTE_MM, TEXT_HEIGHT_ROOM_NAME_MM } from "./constants.js";
import { type DxfWriter } from "./dxf-writer.js";
import { encodeDxfText } from "./encoding.js";
import { type DxfEncoding, type DxfVersion } from "./types.js";

export function writeSiteEntities(
  writer: DxfWriter,
  site: Site,
  version: DxfVersion,
  encoding: DxfEncoding,
): void {
  const layer = "SITE";
  if (site.boundary.length > 0) {
    writer.writePolyline(layer, site.boundary, true, version);
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const pt of site.boundary) {
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  }
  if (minX === Infinity) return;

  const roadWidth = site.road.widthMm > 0 ? site.road.widthMm : 4000;
  const roadM = (roadWidth / 1000).toFixed(1);
  const roadText = encodeDxfText(`道路 幅員 ${roadM}m`, encoding);
  const areaText = encodeDxfText(
    `敷地面積: ${site.areaM2.toFixed(2)} m²`,
    encoding,
  );

  const side = site.road.side;
  if (side === "south" || side === "南") {
    const roadY = minY - roadWidth;
    writer.writeLine(layer, minX - 2000, roadY, maxX + 2000, roadY, version);
    writer.writeText(
      layer,
      roadText,
      Math.round((minX + maxX) / 2),
      Math.round(minY - roadWidth / 2),
      TEXT_HEIGHT_ROOM_NAME_MM,
      0,
      1,
      2,
      version,
    );
  } else if (side === "north" || side === "北") {
    const roadY = maxY + roadWidth;
    writer.writeLine(layer, minX - 2000, roadY, maxX + 2000, roadY, version);
    writer.writeText(
      layer,
      roadText,
      Math.round((minX + maxX) / 2),
      Math.round(maxY + roadWidth / 2),
      TEXT_HEIGHT_ROOM_NAME_MM,
      0,
      1,
      2,
      version,
    );
  } else if (side === "east" || side === "東") {
    const roadX = maxX + roadWidth;
    writer.writeLine(layer, roadX, minY - 2000, roadX, maxY + 2000, version);
    writer.writeText(
      layer,
      roadText,
      Math.round(maxX + roadWidth / 2),
      Math.round((minY + maxY) / 2),
      TEXT_HEIGHT_ROOM_NAME_MM,
      90,
      1,
      2,
      version,
    );
  } else {
    const roadX = minX - roadWidth;
    writer.writeLine(layer, roadX, minY - 2000, roadX, maxY + 2000, version);
    writer.writeText(
      layer,
      roadText,
      Math.round(minX - roadWidth / 2),
      Math.round((minY + maxY) / 2),
      TEXT_HEIGHT_ROOM_NAME_MM,
      90,
      1,
      2,
      version,
    );
  }

  writer.writeText(
    layer,
    areaText,
    minX + 500,
    maxY - 500,
    TEXT_HEIGHT_NOTE_MM,
    0,
    0,
    0,
    version,
  );
}
