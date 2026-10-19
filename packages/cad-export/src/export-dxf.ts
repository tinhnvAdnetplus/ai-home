import { type BuildingModel } from "@aihome/bdm";
import { computeModelBounds } from "./bounds.js";
import { DEFAULT_SCALE, PAPER_DIMENSIONS_MM } from "./constants.js";
import { writeDimensionEntities } from "./dimension-entities.js";
import { DxfWriter } from "./dxf-writer.js";
import {
  writeBlocksSection,
  writeHeaderSection,
  writeObjectsSection,
} from "./header-section.js";
import { getFloorLayerDefs } from "./layers.js";
import { writeOpeningEntities } from "./opening-entities.js";
import { writeRoomEntities } from "./room-entities.js";
import { writeSiteEntities } from "./site-entities.js";
import { writeStairEntities } from "./stair-entities.js";
import { writeTablesSection } from "./tables-section.js";
import { writeTitleBlock } from "./title-block.js";
import { type BoundingBox2D, type ExportDxfOptions } from "./types.js";
import { writeWallEntities } from "./wall-entities.js";

function computePaperExtents(
  bounds: BoundingBox2D,
  options?: ExportDxfOptions,
): BoundingBox2D {
  const paperSize = options?.paperSize ?? "A3";
  const scale = options?.scale ?? DEFAULT_SCALE;
  const paper = PAPER_DIMENSIONS_MM[paperSize];
  const sheetWMm = paper.widthMm * scale;
  const sheetHMm = paper.heightMm * scale;
  const midX = (bounds.minX + bounds.maxX) / 2;
  const midY = (bounds.minY + bounds.maxY) / 2;
  const x0 = Math.round(midX - sheetWMm / 2);
  const y0 = Math.round(midY - sheetHMm / 2);
  return {
    minX: x0,
    minY: y0,
    maxX: x0 + sheetWMm,
    maxY: y0 + sheetHMm,
  };
}

export function exportDxf(
  model: BuildingModel,
  options?: ExportDxfOptions,
): string {
  const floorLevels = options?.floors ?? model.floors.map((f) => f.level);
  const floorSet = new Set(floorLevels);
  const version = options?.version ?? options?.dxfVersion ?? "R2000";
  const encoding = options?.textEncoding ?? "ascii";
  const hasDimensions = options?.hasDimensions ?? true;
  const hasSite = options?.hasSite ?? true;
  const hasTitleBlock = options?.hasTitleBlock ?? true;

  const writer = new DxfWriter();
  const bounds = computeModelBounds(model, floorLevels, hasSite);
  const extBounds = hasTitleBlock
    ? computePaperExtents(bounds, options)
    : bounds;

  writeHeaderSection(writer, extBounds, version);

  const layers = getFloorLayerDefs(floorLevels, hasSite, hasTitleBlock);
  writeTablesSection(writer, layers, version);
  writeBlocksSection(writer, version);

  writer.push(0, "SECTION");
  writer.push(2, "ENTITIES");

  if (hasSite) {
    writeSiteEntities(writer, model.site, version, encoding);
  }

  for (const floor of model.floors) {
    if (!floorSet.has(floor.level)) continue;
    writeWallEntities(writer, floor, version);
    writeOpeningEntities(writer, floor, version);
    writeRoomEntities(writer, floor, version, encoding);
    writeStairEntities(writer, floor, version);
    if (hasDimensions) {
      writeDimensionEntities(writer, floor, version);
    }
  }

  if (hasTitleBlock) {
    writeTitleBlock(writer, model, bounds, options, version, encoding);
  }

  writer.push(0, "ENDSEC");
  writeObjectsSection(writer, version);
  writer.push(0, "EOF");

  return writer.toDxfString();
}
