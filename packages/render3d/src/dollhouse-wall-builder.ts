import * as THREE from 'three';
import {
    type Floor,
    type Wall,
    type WallSpan,
    resolveWallSpans,
    wallThicknessMm,
} from '@aihome/bdm';
import { computeSegmentAngle, toThreeX, toThreeY, toThreeZ } from './coords.js';
import { buildEntranceLattice } from './entrance-accent-builder.js';
import { type MaterialRegistry } from './types.js';
import { buildWallOpenings } from './wall-openings-builder.js';
import { addWallPlinth, createSegmentMesh, skinSpan } from './wall-segment.js';
import { type DollhouseCutawayContext } from './dollhouse-cutaway.js';
import { computeWallMidAndNormal } from './dollhouse-wall-normal.js';

function buildWallCutMesh(
    wall: Wall,
    lenMm: number,
    thickM: number,
    elevM: number,
    rotY: number,
    wallMat: THREE.Material,
    reg: MaterialRegistry,
    cutawayCtx: DollhouseCutawayContext,
    span: WallSpan,
): THREE.Mesh {
    const lenM = (span.endMm - span.startMm) * 0.001;
    const mid = (span.startMm + span.endMm) / 2 / lenMm;
    const geo = new THREE.BoxGeometry(lenM, 0.3, thickM);
    reg.trackGeometry(geo);

    const mats = [
        wallMat,
        wallMat,
        cutawayCtx.whiteCutTopMaterial,
        wallMat,
        wallMat,
        wallMat,
    ];
    const mesh = new THREE.Mesh(geo, mats);
    mesh.position.set(
        toThreeX(wall.a.x + (wall.b.x - wall.a.x) * mid),
        elevM + 0.15,
        toThreeZ(wall.a.y + (wall.b.y - wall.a.y) * mid),
    );
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

export function buildDollhouseFloorWalls(
    floor: Floor,
    reg: MaterialRegistry,
    cutawayCtx: DollhouseCutawayContext,
    bCenter: THREE.Vector3,
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

        const entranceOp = floor.level === 1 ? ops.find((o) => o.kind === 'entrance') : undefined;
        const wallMat = wall.kind === 'exterior' ? reg.wallExterior : reg.wallInterior;
        const accentMat = wall.kind === 'exterior' ? reg.wallExteriorAlt : undefined;

        const rotY = computeSegmentAngle(dx * 0.001, -dy * 0.001);
        const thickM = wallThicknessMm(wall) * 0.001;
        const elevM = toThreeY(floor.elevationMm);

        const fullGroup = new THREE.Group();
        const cutGroup = new THREE.Group();

        if (wall.kind === 'exterior' && floor.level === 1) {
            addWallPlinth(wall, rotY, lenMm, thickM, fullGroup, reg, span);
            addWallPlinth(wall, rotY, lenMm, thickM, cutGroup, reg, span);
            if (entranceOp && hasEntranceLattice) {
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
                if (lattice) fullGroup.add(lattice);
            }
        }

        if (wall.kind === 'exterior' && floor.level > 1) {
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
            if (belt) fullGroup.add(belt);
        }

        buildWallOpenings(
            wall,
            ops,
            lenMm,
            floor,
            fullGroup,
            wallMat,
            reg,
            accentMat,
            span,
        );

        const cutMesh = buildWallCutMesh(
            wall,
            lenMm,
            thickM,
            elevM,
            rotY,
            wallMat,
            reg,
            cutawayCtx,
            span,
        );
        cutGroup.add(cutMesh);

        const mid = computeWallMidAndNormal(wall, dx, dy, bCenter);
        cutawayCtx.addItem({
            fullGroup,
            cutGroup,
            normal: mid.normal,
            center: mid.center,
            isExterior: wall.kind === 'exterior',
        });

        group.add(fullGroup);
        group.add(cutGroup);
    }

    return group;
}
