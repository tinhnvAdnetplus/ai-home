import { type RoadSide } from './element-types.js';

export type Compass = 'north' | 'east' | 'south' | 'west';

/**
 * Sides of the building in model terms. The model has y = 0 at the road, and every
 * drawing shows the road at the bottom: front = road side (y = 0), back = y max,
 * left = x = 0, right = x max.
 */
export type ModelFace = 'back' | 'right' | 'front' | 'left';

// both lists run clockwise, so with a south road each compass side is the same face
const COMPASS: readonly Compass[] = ['north', 'east', 'south', 'west'];
const FACES: readonly ModelFace[] = ['back', 'right', 'front', 'left'];

const ROAD_TO_COMPASS: Record<RoadSide, Compass> = {
    north: 'north',
    east: 'east',
    south: 'south',
    west: 'west',
    北: 'north',
    東: 'east',
    南: 'south',
    西: 'west',
};

export function roadCompass(road: RoadSide): Compass {
    return ROAD_TO_COMPASS[road];
}

/** Quarter turns from the south-road layout (where back = north) to this road. */
function turns(road: RoadSide): number {
    return COMPASS.indexOf(roadCompass(road)) - 2;
}

function mod4(n: number): number {
    return ((n % 4) + 4) % 4;
}

export function compassToFace(road: RoadSide, compass: Compass): ModelFace {
    return FACES[mod4(COMPASS.indexOf(compass) - turns(road))] ?? 'front';
}

export function faceToCompass(road: RoadSide, face: ModelFace): Compass {
    return COMPASS[mod4(FACES.indexOf(face) + turns(road))] ?? 'south';
}

/** The face that gets the sun (south side of the building). */
export function sunFace(road: RoadSide): ModelFace {
    return compassToFace(road, 'south');
}

/**
 * Clockwise angle (degrees) of the north arrow on a drawing that shows the road at the
 * bottom and +x to the right: 0 = up (south road), 90 = right (east road), 180 = down (north road).
 */
export function northArrowAngleDeg(road: RoadSide): number {
    return mod4(-turns(road)) * 90;
}
