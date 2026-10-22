import * as THREE from 'three';
import {
    type Floor,
    type Opening,
    type Wall,
    type WallSpan,
} from '@aihome/bdm';
import { computeSegmentAngle, toThreeY } from './coords.js';
import { buildOpeningElement } from './opening-builder.js';
import { type MaterialRegistry } from './types.js';
import { createSegmentMesh } from './wall-segment.js';
import { computeEntranceAccentBand } from './entrance-accent-band.js';

export function buildWallOpenings(
    wall: Wall,
    openings: readonly Opening[],
    lenMm: number,
    floor: Floor,
    group: THREE.Group,
    baseMat: THREE.Material,
    reg: MaterialRegistry,
    accentMat?: THREE.Material,
    span: WallSpan = { startMm: 0, endMm: lenMm },
): void {
    const thickM = (wall.thicknessMm > 0 ? wall.thicknessMm : 150) * 0.001;
    const floorHM = (floor.heightMm > 0 ? floor.heightMm : 2800) * 0.001;
    const elevM = toThreeY(floor.elevationMm);
    const rotY = computeSegmentAngle(
        (wall.b.x - wall.a.x) * 0.001,
        -(wall.b.y - wall.a.y) * 0.001,
    );

    // The entrance accent colour (if any) only tints the stretch of wall that actually
    // borders the entrance room's own footprint - never the neighbouring rooms' frontage,
    // even when they share the same long wall id (e.g. the whole front facade).
    const entranceOp = openings.find((o) => o.kind === 'entrance');
    const accentBand = entranceOp
        ? computeEntranceAccentBand(floor, wall, lenMm)
        : null;
    const matFor = (segStart: number, segEnd: number): THREE.Material => {
        if (!accentMat || !accentBand) return baseMat;
        const segCenter = (segStart + segEnd) / 2;
        return segCenter >= accentBand[0] && segCenter <= accentBand[1]
            ? accentMat
            : baseMat;
    };

    // The solid runs over the junction-resolved span; an opening can only exist in the part of
    // it that is not inside a crossing wall (the validator reports any opening clipped here).
    const clearStart = Math.max(0, span.startMm);
    const clearEnd = Math.min(lenMm, span.endMm);
    let cursorMm = span.startMm;
    for (const op of openings) {
        const opStart = Math.max(clearStart, Math.min(op.offsetMm, clearEnd));
        const opEnd = Math.max(
            opStart,
            Math.min(op.offsetMm + op.widthMm, clearEnd),
        );

        if (opStart > cursorMm) {
            const s = createSegmentMesh(
                cursorMm,
                opStart,
                elevM,
                floorHM,
                thickM,
                wall,
                rotY,
                lenMm,
                matFor(cursorMm, opStart),
                reg,
            );
            if (s) group.add(s);
        }
        if (op.sillMm > 0) {
            const sillH = Math.min(op.sillMm, floor.heightMm) * 0.001;
            const sill = createSegmentMesh(
                opStart,
                opEnd,
                elevM,
                sillH,
                thickM,
                wall,
                rotY,
                lenMm,
                matFor(opStart, opEnd),
                reg,
            );
            if (sill) group.add(sill);
        }
        const topMm = op.sillMm + op.heightMm;
        if (topMm < floor.heightMm) {
            const lintel = createSegmentMesh(
                opStart,
                opEnd,
                elevM + topMm * 0.001,
                (floor.heightMm - topMm) * 0.001,
                thickM,
                wall,
                rotY,
                lenMm,
                matFor(opStart, opEnd),
                reg,
            );
            if (lintel) group.add(lintel);
        }
        const opElem = buildOpeningElement({
            opening: op,
            startMm: opStart,
            endMm: opEnd,
            wallStart: wall.a,
            wallVector: { dx: wall.b.x - wall.a.x, dy: wall.b.y - wall.a.y },
            wallLengthMm: lenMm,
            elevationMm: floor.elevationMm,
            registry: reg,
        });
        if (opElem) group.add(opElem);
        cursorMm = Math.max(cursorMm, opEnd);
    }
    if (cursorMm < span.endMm) {
        const endS = createSegmentMesh(
            cursorMm,
            span.endMm,
            elevM,
            floorHM,
            thickM,
            wall,
            rotY,
            lenMm,
            matFor(cursorMm, span.endMm),
            reg,
        );
        if (endS) group.add(endS);
    }
}
