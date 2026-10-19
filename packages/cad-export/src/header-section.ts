import { type DxfWriter } from "./dxf-writer.js";
import { type BoundingBox2D, type DxfVersion } from "./types.js";

function isR12(version: DxfVersion): boolean {
  return version === "R12";
}

export function writeHeaderSection(
  writer: DxfWriter,
  bounds: BoundingBox2D,
  version: DxfVersion,
): void {
  writer.push(0, "SECTION");
  writer.push(2, "HEADER");

  writer.push(9, "$ACADVER");
  writer.push(1, isR12(version) ? "AC1009" : "AC1015");

  writer.push(9, "$DWGCODEPAGE");
  writer.push(3, "ANSI_932");

  if (!isR12(version)) {
    writer.reserveHandseed();
  }

  writer.push(9, "$INSUNITS");
  writer.push(70, 4);

  writer.push(9, "$MEASUREMENT");
  writer.push(70, 1);

  writer.push(9, "$EXTMIN");
  writer.push(10, bounds.minX);
  writer.push(20, bounds.minY);
  writer.push(30, 0.0);

  writer.push(9, "$EXTMAX");
  writer.push(10, bounds.maxX);
  writer.push(20, bounds.maxY);
  writer.push(30, 0.0);

  writer.push(0, "ENDSEC");
}

export function writeBlocksSection(
  writer: DxfWriter,
  version: DxfVersion,
): void {
  writer.push(0, "SECTION");
  writer.push(2, "BLOCKS");

  if (!isR12(version)) {
    writer.push(0, "BLOCK");
    writer.push(5, writer.nextHandle());
    writer.push(100, "AcDbEntity");
    writer.push(8, "0");
    writer.push(100, "AcDbBlockBegin");
    writer.push(2, "*MODEL_SPACE");
    writer.push(70, 0);
    writer.push(10, 0.0);
    writer.push(20, 0.0);
    writer.push(30, 0.0);
    writer.push(3, "*MODEL_SPACE");
    writer.push(1, "");
    writer.push(0, "ENDBLK");
    writer.push(5, writer.nextHandle());
    writer.push(100, "AcDbEntity");
    writer.push(8, "0");
    writer.push(100, "AcDbBlockEnd");

    writer.push(0, "BLOCK");
    writer.push(5, writer.nextHandle());
    writer.push(100, "AcDbEntity");
    writer.push(8, "0");
    writer.push(100, "AcDbBlockBegin");
    writer.push(2, "*PAPER_SPACE");
    writer.push(70, 0);
    writer.push(10, 0.0);
    writer.push(20, 0.0);
    writer.push(30, 0.0);
    writer.push(3, "*PAPER_SPACE");
    writer.push(1, "");
    writer.push(0, "ENDBLK");
    writer.push(5, writer.nextHandle());
    writer.push(100, "AcDbEntity");
    writer.push(8, "0");
    writer.push(100, "AcDbBlockEnd");
  }

  writer.push(0, "ENDSEC");
}

export function writeObjectsSection(
  writer: DxfWriter,
  version: DxfVersion,
): void {
  if (isR12(version)) return;
  writer.push(0, "SECTION");
  writer.push(2, "OBJECTS");
  writer.push(0, "DICTIONARY");
  writer.push(5, writer.nextHandle());
  writer.push(330, "0");
  writer.push(100, "AcDbDictionary");
  writer.push(281, 1);
  writer.push(0, "ENDSEC");
}
