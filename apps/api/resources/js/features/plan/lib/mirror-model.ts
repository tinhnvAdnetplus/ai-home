import { type BuildingModel, type Fixture, type Point } from '@aihome/bdm';
import { fixtureFootprintMm, isFixtureKind } from '@aihome/planner';

const ROTATION_STEPS = [0, 90, 180, 270] as const;

/** 0/90/180/270, wrapped into [0, 360). Fixture.rotation is a plain `number` in BDM, but the
 * catalog (and the 2D renderer) only knows these 4 steps. */
function normalizeRotation(deg: number): 0 | 90 | 180 | 270 {
    const step = ((Math.round(deg / 90) % 4) + 4) % 4;
    return ROTATION_STEPS[step] ?? 0;
}

/**
 * Flipping a POINT is correct for room/wall/stair geometry (every vertex of the polygon is
 * flipped individually). A fixture's `pos` is only its top-left corner, not a polygon — flipping
 * that one point without accounting for the item's height would silently shift it upward by its
 * own height once drawn, since the corner that was "top" becomes "bottom" after a Y mirror.
 */
function flipFixture(x: Fixture, top: number): Fixture {
    const heightMm = isFixtureKind(x.kind)
        ? fixtureFootprintMm(x.kind, normalizeRotation(x.rotation)).heightMm
        : 0;
    const rotation = normalizeRotation(-x.rotation);
    return { ...x, pos: { x: x.pos.x, y: top - x.pos.y - heightMm }, rotation };
}

/**
 * BDM has y = 0 at the road side. Japanese plans (and the 3D view from the road)
 * show the road at the bottom, so the 2D drawing mirrors the model vertically.
 * Opening offsets are measured along each wall from its first point, so they stay valid.
 */
export function mirrorModelY(model: BuildingModel): BuildingModel {
    const ys = [
        ...model.site.boundary.map((p) => p.y),
        ...model.floors.flatMap((f) => f.walls.flatMap((w) => [w.a.y, w.b.y])),
    ];
    const top = Math.max(...ys, 0);
    const flip = (p: Point): Point => ({ x: p.x, y: top - p.y });
    const parking = model.parking.polygon
        ? { ...model.parking, polygon: model.parking.polygon.map(flip) }
        : model.parking;
    const exterior = model.exterior
        ? {
              ...model.exterior,
              deckPolygon: model.exterior.deckPolygon?.map(flip),
              approachPolygon: model.exterior.approachPolygon?.map(flip),
              trees: model.exterior.trees?.map((tree) => ({
                  ...tree,
                  pos: flip(tree.pos),
              })),
          }
        : undefined;
    return {
        ...model,
        site: { ...model.site, boundary: model.site.boundary.map(flip) },
        parking,
        exterior,
        floors: model.floors.map((f) => ({
            ...f,
            rooms: f.rooms.map((r) => ({ ...r, polygon: r.polygon.map(flip) })),
            walls: f.walls.map((w) => ({ ...w, a: flip(w.a), b: flip(w.b) })),
            fixtures: f.fixtures.map((x) => flipFixture(x, top)),
            stairs: f.stairs.map((s) => ({
                ...s,
                polygon: s.polygon.map(flip),
            })),
        })),
    };
}
