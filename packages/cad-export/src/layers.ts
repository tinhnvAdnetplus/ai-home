import {
  ACI_BLUE,
  ACI_CYAN,
  ACI_GREEN,
  ACI_MAGENTA,
  ACI_RED,
  ACI_WHITE,
  ACI_YELLOW,
  LINEWEIGHT_DIM,
  LINEWEIGHT_EXT_WALL,
  LINEWEIGHT_INT_WALL,
  LINEWEIGHT_OPENING,
  LINEWEIGHT_ROOM,
  LINEWEIGHT_SITE,
  LINEWEIGHT_STAIR,
  LINEWEIGHT_TEXT,
  LINEWEIGHT_TITLE,
} from "./constants.js";
import { type LayerDef } from "./types.js";

export function getFloorLayerDefs(
  floorLevels: readonly number[],
  hasSite: boolean,
  hasTitleBlock: boolean,
): readonly LayerDef[] {
  const layers: LayerDef[] = [
    { name: "0", color: ACI_WHITE, lineweight: LINEWEIGHT_INT_WALL },
  ];

  for (const level of floorLevels) {
    const lvl = level.toString();
    layers.push(
      {
        name: `F${lvl}-WALL-EXT`,
        color: ACI_CYAN,
        lineweight: LINEWEIGHT_EXT_WALL,
      },
      {
        name: `F${lvl}-WALL-INT`,
        color: ACI_WHITE,
        lineweight: LINEWEIGHT_INT_WALL,
      },
      {
        name: `F${lvl}-DOOR`,
        color: ACI_GREEN,
        lineweight: LINEWEIGHT_OPENING,
      },
      {
        name: `F${lvl}-WINDOW`,
        color: ACI_BLUE,
        lineweight: LINEWEIGHT_OPENING,
      },
      {
        name: `F${lvl}-ROOM`,
        color: ACI_MAGENTA,
        lineweight: LINEWEIGHT_ROOM,
      },
      {
        name: `F${lvl}-STAIR`,
        color: ACI_YELLOW,
        lineweight: LINEWEIGHT_STAIR,
      },
      {
        name: `F${lvl}-TEXT`,
        color: ACI_WHITE,
        lineweight: LINEWEIGHT_TEXT,
      },
      {
        name: `F${lvl}-DIM`,
        color: ACI_RED,
        lineweight: LINEWEIGHT_DIM,
      },
    );
  }

  if (hasSite) {
    layers.push({
      name: "SITE",
      color: ACI_YELLOW,
      lineweight: LINEWEIGHT_SITE,
    });
  }
  if (hasTitleBlock) {
    layers.push({
      name: "TITLE",
      color: ACI_WHITE,
      lineweight: LINEWEIGHT_TITLE,
    });
  }

  return layers;
}
