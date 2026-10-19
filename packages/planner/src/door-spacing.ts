import { type DoorSpec } from './circulation.js';

/** Swing arcs of neighbouring doors on one wall line collide: use sliding doors there. */
export function slideCrowdedDoors(doors: readonly DoorSpec[]): DoorSpec[] {
    return doors.map((d): DoorSpec => {
        const isCrowded = doors.some(
            (o) =>
                o !== d &&
                o.dir === d.dir &&
                o.pos === d.pos &&
                Math.abs((o.a + o.b) / 2 - (d.a + d.b) / 2) < 1.6,
        );
        return isCrowded && d.kind === 'swing' ? { ...d, kind: 'slide' } : d;
    });
}
