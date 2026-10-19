export { exportDxf } from "./export-dxf.js";
export { dxfFileName } from "./file-name.js";
export { validateDxfStructure } from "./validate.js";
export { encodeDxfText } from "./encoding.js";
export { writeNorthArrow } from "./north-arrow.js";
export { writeScaleBar } from "./scale-bar.js";

export type {
  DxfVersion,
  DxfEncoding,
  PaperSize,
  TitleBlockInfo,
  ExportDxfOptions,
  DxfFileNameOptions,
  DxfValidationResult,
  LayerDef,
  Point2D,
  BoundingBox2D,
} from "./types.js";

export {
  ACI_RED,
  ACI_YELLOW,
  ACI_GREEN,
  ACI_CYAN,
  ACI_BLUE,
  ACI_MAGENTA,
  ACI_WHITE,
  ACI_GRAY,
  LINEWEIGHT_EXT_WALL,
  LINEWEIGHT_INT_WALL,
  LINEWEIGHT_OPENING,
  LINEWEIGHT_ROOM,
  LINEWEIGHT_STAIR,
  LINEWEIGHT_TEXT,
  LINEWEIGHT_DIM,
  LINEWEIGHT_SITE,
  LINEWEIGHT_TITLE,
  DEFAULT_SCALE,
  PAPER_DIMENSIONS_MM,
  TEXT_HEIGHT_ROOM_NAME_MM,
  TEXT_HEIGHT_ROOM_AREA_MM,
  TEXT_HEIGHT_DIMENSION_MM,
  TEXT_HEIGHT_TITLE_MM,
  TEXT_HEIGHT_NOTE_MM,
} from "./constants.js";
