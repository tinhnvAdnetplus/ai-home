import { type PaperSize } from "./types.js";

export const ACI_RED = 1;
export const ACI_YELLOW = 2;
export const ACI_GREEN = 3;
export const ACI_CYAN = 4;
export const ACI_BLUE = 5;
export const ACI_MAGENTA = 6;
export const ACI_WHITE = 7;
export const ACI_GRAY = 8;

export const LINEWEIGHT_EXT_WALL = 50;
export const LINEWEIGHT_INT_WALL = 25;
export const LINEWEIGHT_OPENING = 18;
export const LINEWEIGHT_ROOM = 18;
export const LINEWEIGHT_STAIR = 25;
export const LINEWEIGHT_TEXT = 18;
export const LINEWEIGHT_DIM = 13;
export const LINEWEIGHT_SITE = 25;
export const LINEWEIGHT_TITLE = 25;

export const PAPER_DIMENSIONS_MM: Record<
  PaperSize,
  { readonly widthMm: number; readonly heightMm: number }
> = {
  A4: { widthMm: 297, heightMm: 210 },
  A3: { widthMm: 420, heightMm: 297 },
  A2: { widthMm: 594, heightMm: 420 },
  A1: { widthMm: 841, heightMm: 594 },
};

export const DEFAULT_SCALE = 100;
export const TEXT_HEIGHT_ROOM_NAME_MM = 220;
export const TEXT_HEIGHT_ROOM_AREA_MM = 160;
export const TEXT_HEIGHT_DIMENSION_MM = 200;
export const TEXT_HEIGHT_TITLE_MM = 350;
export const TEXT_HEIGHT_NOTE_MM = 180;
