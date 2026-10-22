import * as THREE from 'three';
import { type Floor, resolveWallSpans, wallThicknessMm } from '@aihome/bdm';
import { computeSegmentAngle, toThreeY } from './coords.js';
import { buildEntranceLattice } from './entrance-accent-builder.js';
import { type MaterialRegistry } from './types.js';
import { buildWallOpenings } from './wall-openings-builder.js';
import { addWallPlinth, createSegmentMesh, skinSpan } from './wall-segment.js';

export function buildFloorWalls(
    floor: Floor,
    reg: MaterialRegistry,
    hasEntranceLattice = true,
): THREE.Group {
    const group = new THREE.Group();
    const spans = resolveWallSpans(floor.walls);

    for (const wall of floor.walls) {
        const dx = wall.b.x - wall.a.x;
        const dy = wall.b.y - wall.a.y;
        const lenMm = Math.hypot(dx, dy);
        if (lenMm < 1) continue;
        const span = spans.get(wall.id) ?? { startMm: 0, endMm: lenMm };
        const beltSpan = skinSpan(span, lenMm, 15);

        const ops = floor.openings
            .filter((o) => o.wallId === wall.id)
            .sort((a, b) => a.offsetMm - b.offsetMm);

        const entranceOp =
            floor.level === 1
                ? ops.find((o) => o.kind === 'entrance')
                : undefined;
        const wallMat =
            wall.kind === 'exterior' ? reg.wallExterior : reg.wallInterior;
        const accentMat =
            wall.kind === 'exterior' ? reg.wallExteriorAlt : undefined;

        const rotY = computeSegmentAngle(dx * 0.001, -dy * 0.001);
        const thickM = wallThicknessMm(wall) * 0.001;

        if (wall.kind === 'exterior' && floor.level === 1) {
            addWallPlinth(wall, rotY, lenMm, thickM, group, reg, span);
            if (hasEntranceLattice && entranceOp) {
                const lattice = buildEntranceLattice({
                    wallStart: wall.a,
                    wallVector: { dx, dy },
                    wallLengthMm: lenMm,
                    wallThicknessM: thickM,
                    floorHeightM: (floor.heightMm || 2800) * 0.001,
                    elevationMm: floor.elevationMm,
                    entranceOffsetMm: entranceOp.offsetMm,
                    entranceWidthMm: entranceOp.widthMm,
                    registry: reg,
                });
                if (lattice) group.add(lattice);
            }
        }

        // Subtle belt line between floors
        if (wall.kind === 'exterior' && floor.level > 1) {
            const elevM = toThreeY(floor.elevationMm);
            const belt = createSegmentMesh(
                beltSpan.startMm,
                beltSpan.endMm,
                elevM - 0.05,
                0.1,
                thickM + 0.03,
                wall,
                rotY,
                lenMm,
                reg.beltLine,
                reg,
            );
            if (belt) group.add(belt);
        }

        buildWallOpenings(
            wall,
            ops,
            lenMm,
            floor,
            group,
            wallMat,
            reg,
            accentMat,
            span,
        );
    }

    return group;
}
