import * as THREE from 'three';
import { addBox } from './stair-parts.js';
import { type MaterialRegistry } from './types.js';

export type StairRailParams = {
    readonly x0: number;
    readonly flightW: number;
    readonly baseY: number;
    readonly stepH: number;
    readonly zOf: (t: number) => number;
    readonly treadD: number;
    readonly stepsPerFlight: number;
    readonly landTop: number;
    readonly tLand: number;
    readonly landingD: number;
};

const POST_SIZE = 0.035;
const RAIL_SIZE: readonly [number, number] = [0.04, 0.04];
const RAIL_HEIGHT = 0.9;

function addPost(
    group: THREE.Group,
    reg: MaterialRegistry,
    mat: THREE.Material,
    x: number,
    topY: number,
    z: number,
): void {
    const h = topY - 0; // measured from floor-local 0, caller passes absolute topY
    addBox(group, reg, mat, [POST_SIZE, h, POST_SIZE], [x, topY / 2, z]);
}

/** Slim baluster-and-rail guard along one straight run (never a solid panel). */
function addRailRun(
    group: THREE.Group,
    reg: MaterialRegistry,
    mat: THREE.Material,
    x: number,
    yFrom: number,
    yTo: number,
    zFrom: number,
    zTo: number,
    postCount: number,
): void {
    for (let i = 0; i <= postCount; i += 1) {
        const f = i / postCount;
        const y = yFrom + (yTo - yFrom) * f;
        const z = zFrom + (zTo - zFrom) * f;
        addBox(
            group,
            reg,
            mat,
            [POST_SIZE, RAIL_HEIGHT, POST_SIZE],
            [x, y + RAIL_HEIGHT / 2, z],
        );
    }
    const dz = zTo - zFrom;
    const dy = yTo - yFrom;
    const len = Math.hypot(dz, dy);
    const railGeo = new THREE.BoxGeometry(len, RAIL_SIZE[0], RAIL_SIZE[1]);
    reg.trackGeometry(railGeo);
    const railMesh = new THREE.Mesh(railGeo, mat);
    railMesh.position.set(
        x,
        (yFrom + yTo) / 2 + RAIL_HEIGHT,
        (zFrom + zTo) / 2,
    );
    const angle = Math.atan2(yTo - yFrom, dz);
    railMesh.rotation.x = -angle;
    railMesh.rotation.z = Math.PI / 2;
    railMesh.castShadow = true;
    group.add(railMesh);
}

/**
 * Slim baluster + rail guards on the three open edges of a U-turn stair (both flight outer
 * edges and the landing-side rail joining them). Deliberately thin (3.5cm posts, 4cm rail) so
 * the stair reads as a staircase, never as a solid wall enclosing itself.
 */
export function buildStairRail(
    group: THREE.Group,
    reg: MaterialRegistry,
    p: StairRailParams,
): void {
    const mat = reg.frame;
    const yAt = (step: number): number => p.baseY + (step + 1) * p.stepH;
    const postsPerFlight = Math.max(2, p.stepsPerFlight - 1);

    // Flight 1 outer edge (x0 side), open end -> landing
    addRailRun(
        group,
        reg,
        mat,
        p.x0 + 0.05,
        yAt(0),
        p.landTop,
        p.zOf(0.5 * p.treadD),
        p.zOf(p.stepsPerFlight * p.treadD),
        postsPerFlight,
    );
    // Flight 2 outer edge (far side), landing -> open end
    addRailRun(
        group,
        reg,
        mat,
        p.x0 + p.flightW * 2 - 0.05,
        p.landTop,
        yAt(0),
        p.zOf(p.stepsPerFlight * p.treadD),
        p.zOf(0.5 * p.treadD),
        postsPerFlight,
    );
    // Landing-side rail between the two flights (post-and-rail, flush with the landing edge)
    addPost(
        group,
        reg,
        mat,
        p.x0 + p.flightW,
        p.landTop + RAIL_HEIGHT,
        p.zOf(p.tLand - p.landingD / 2),
    );
}
