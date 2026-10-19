import { northArrowAngleDeg, type RoadSide } from '@aihome/bdm';

export type NorthArrowPose = {
    /** SVG transform for the arrow shape drawn pointing up */
    readonly rotate: string;
    /** centre of the upright "北" label, `distance` away from the arrow centre towards north */
    readonly labelAt: (distance: number) => { x: number; y: number };
};

/** Plans show the road at the bottom, so north points wherever the road side puts it. */
export function northArrowPose(road: RoadSide): NorthArrowPose {
    const deg = northArrowAngleDeg(road);
    const rad = (deg * Math.PI) / 180;
    return {
        rotate: `rotate(${deg.toString()})`,
        labelAt: (distance) => ({
            // `|| 0` keeps -0 out of the SVG attributes
            x: Math.round(Math.sin(rad) * distance) || 0,
            y: Math.round(-Math.cos(rad) * distance) || 0,
        }),
    };
}
