import { type DxfWriter } from "./dxf-writer.js";
import { type DxfVersion, type LayerDef } from "./types.js";

function isR12(version: DxfVersion): boolean {
  return version === "R12";
}

function writeVportTable(writer: DxfWriter, version: DxfVersion): void {
  writer.push(0, "TABLE");
  writer.push(2, "VPORT");
  if (!isR12(version)) {
    writer.push(5, writer.nextHandle());
    writer.push(100, "AcDbSymbolTable");
  }
  writer.push(70, 1);
  writer.push(0, "VPORT");
  if (!isR12(version)) {
    writer.push(5, writer.nextHandle());
    writer.push(100, "AcDbSymbolTableRecord");
    writer.push(100, "AcDbViewportTableRecord");
  }
  writer.push(2, "*ACTIVE");
  writer.push(70, 0);
  writer.push(10, 0.0);
  writer.push(20, 0.0);
  writer.push(11, 1.0);
  writer.push(21, 1.0);
  writer.push(12, 0.0);
  writer.push(22, 0.0);
  writer.push(40, 1000.0);
  writer.push(41, 1.4);
  writer.push(0, "ENDTAB");
}

function writeLtypeTable(writer: DxfWriter, version: DxfVersion): void {
  writer.push(0, "TABLE");
  writer.push(2, "LTYPE");
  if (!isR12(version)) {
    writer.push(5, writer.nextHandle());
    writer.push(100, "AcDbSymbolTable");
  }
  writer.push(70, 1);
  writer.push(0, "LTYPE");
  if (!isR12(version)) {
    writer.push(5, writer.nextHandle());
    writer.push(100, "AcDbSymbolTableRecord");
    writer.push(100, "AcDbLinetypeTableRecord");
  }
  writer.push(2, "CONTINUOUS");
  writer.push(70, 0);
  writer.push(3, "Solid");
  writer.push(72, 65);
  writer.push(73, 0);
  writer.push(40, 0.0);
  writer.push(0, "ENDTAB");
}

function writeLayerTable(
  writer: DxfWriter,
  layers: readonly LayerDef[],
  version: DxfVersion,
): void {
  writer.push(0, "TABLE");
  writer.push(2, "LAYER");
  if (!isR12(version)) {
    writer.push(5, writer.nextHandle());
    writer.push(100, "AcDbSymbolTable");
  }
  writer.push(70, layers.length);
  for (const lyr of layers) {
    writer.push(0, "LAYER");
    if (!isR12(version)) {
      writer.push(5, writer.nextHandle());
      writer.push(100, "AcDbSymbolTableRecord");
      writer.push(100, "AcDbLayerTableRecord");
    }
    writer.push(2, lyr.name);
    writer.push(70, 0);
    writer.push(62, lyr.color);
    writer.push(6, "CONTINUOUS");
    if (!isR12(version) && lyr.lineweight !== undefined) {
      writer.push(370, lyr.lineweight);
    }
  }
  writer.push(0, "ENDTAB");
}

function writeStyleTable(writer: DxfWriter, version: DxfVersion): void {
  writer.push(0, "TABLE");
  writer.push(2, "STYLE");
  if (!isR12(version)) {
    writer.push(5, writer.nextHandle());
    writer.push(100, "AcDbSymbolTable");
  }
  writer.push(70, 1);
  writer.push(0, "STYLE");
  if (!isR12(version)) {
    writer.push(5, writer.nextHandle());
    writer.push(100, "AcDbSymbolTableRecord");
    writer.push(100, "AcDbTextStyleTableRecord");
  }
  writer.push(2, "STANDARD");
  writer.push(70, 0);
  writer.push(40, 0.0);
  writer.push(41, 1.0);
  writer.push(50, 0.0);
  writer.push(71, 0);
  writer.push(42, 2.5);
  writer.push(3, "txt");
  writer.push(4, "");
  writer.push(0, "ENDTAB");
}

function writeBlockRecordTable(writer: DxfWriter): void {
  writer.push(0, "TABLE");
  writer.push(2, "BLOCK_RECORD");
  writer.push(5, writer.nextHandle());
  writer.push(100, "AcDbSymbolTable");
  writer.push(70, 2);
  writer.push(0, "BLOCK_RECORD");
  writer.push(5, writer.nextHandle());
  writer.push(100, "AcDbSymbolTableRecord");
  writer.push(100, "AcDbBlockTableRecord");
  writer.push(2, "*MODEL_SPACE");
  writer.push(0, "BLOCK_RECORD");
  writer.push(5, writer.nextHandle());
  writer.push(100, "AcDbSymbolTableRecord");
  writer.push(100, "AcDbBlockTableRecord");
  writer.push(2, "*PAPER_SPACE");
  writer.push(0, "ENDTAB");
}

export function writeTablesSection(
  writer: DxfWriter,
  layers: readonly LayerDef[],
  version: DxfVersion,
): void {
  writer.push(0, "SECTION");
  writer.push(2, "TABLES");
  writeVportTable(writer, version);
  writeLtypeTable(writer, version);
  writeLayerTable(writer, layers, version);
  writeStyleTable(writer, version);
  if (!isR12(version)) {
    writeBlockRecordTable(writer);
  }
  writer.push(0, "ENDSEC");
}
