import { compassToFace, type BuildingModel, type ModelFace } from "@aihome/bdm";
import { type ElevationSide } from "./types.js";

// the projection code names model faces as seen with a south road: "south" is the road-side face
const FACE_TO_PROJECTION: Record<ModelFace, ElevationSide> = {
  front: "south",
  back: "north",
  right: "east",
  left: "west",
};

/** Which face of the model a compass elevation looks at, given the road side. */
export function projectionSideFor(
  model: BuildingModel,
  side: ElevationSide,
): ElevationSide {
  return FACE_TO_PROJECTION[compassToFace(model.site.road.side, side)];
}
