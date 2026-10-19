import { type BuildingModel } from "@aihome/bdm";
import { type DxfFileNameOptions } from "./types.js";

export function dxfFileName(
  model: BuildingModel,
  options?: DxfFileNameOptions,
): string {
  const rawPrefix = options?.prefix ?? "plan";
  const cleanPrefix = rawPrefix.replace(/[^a-zA-Z0-9_-]/g, "_");
  const seed = model.meta.seed.toString();
  const version = options?.version ?? options?.dxfVersion;
  const versionTag = version ? `-${version.toLowerCase()}` : "";

  if (options?.floorLevel !== undefined) {
    return `${cleanPrefix}-seed${seed}-f${options.floorLevel.toString()}${versionTag}.dxf`;
  }

  return `${cleanPrefix}-seed${seed}-all${versionTag}.dxf`;
}
