import { type Point2D } from "./types.js";

export function computeLowerRoofs(
  uMinTop: number,
  uMaxTop: number,
  uMinOverall: number,
  uMaxOverall: number,
  secondFloorElev: number,
): readonly (readonly Point2D[])[] | undefined {
  if (secondFloorElev <= 0) return undefined;

  const lowerRoofs: (readonly Point2D[])[] = [];
  if (uMaxOverall - uMaxTop > 200) {
    lowerRoofs.push([
      { x: uMaxTop, y: secondFloorElev + 350 },
      { x: uMaxOverall + 450, y: secondFloorElev + 100 },
      { x: uMaxOverall + 450, y: secondFloorElev },
      { x: uMaxTop, y: secondFloorElev },
    ]);
  }
  if (uMinTop - uMinOverall > 200) {
    lowerRoofs.push([
      { x: uMinTop, y: secondFloorElev + 350 },
      { x: uMinOverall - 450, y: secondFloorElev + 100 },
      { x: uMinOverall - 450, y: secondFloorElev },
      { x: uMinTop, y: secondFloorElev },
    ]);
  }

  return lowerRoofs.length > 0 ? lowerRoofs : undefined;
}
