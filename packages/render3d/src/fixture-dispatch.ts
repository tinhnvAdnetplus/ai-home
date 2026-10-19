import * as THREE from 'three';
import { type Fixture } from '@aihome/bdm';
import {
    FIXTURE_CATALOG,
    fixtureFootprintMm,
    isFixtureKind,
    type FixtureKind,
} from '@aihome/planner';
import { toThreeX, toThreeZ } from './coords.js';
import { type MaterialRegistry, type Point3D } from './types.js';
import { buildBed, buildWardrobe, buildStudyDesk, buildNightstand } from './furniture-bedroom.js';
import { buildSofa, buildCoffeeTable, buildTvUnit } from './furniture-living.js';
import {
    buildKitchenRun,
    buildKitchenIsland,
    buildRefrigerator,
} from './furniture-kitchen.js';
import {
    buildToilet,
    buildWashbasin,
    buildWashingMachine,
    buildBathtub,
} from './furniture-sanitary.js';
import { buildDiningSet } from './furniture-dining.js';
import { buildShoesCabinet } from './furniture-entry-washitsu.js';

const ROTATION_STEPS = [0, 90, 180, 270] as const;

/** 0/90/180/270. BDM's `Fixture.rotation` is a plain `number`; normalize defensively even
 * though every producer (AI layout, rule-based generator, mirror-model) already emits one of
 * these 4 values. */
function normalizeRotation(deg: number): 0 | 90 | 180 | 270 {
    const step = ((Math.round(deg / 90) % 4) + 4) % 4;
    return ROTATION_STEPS[step] ?? 0;
}

/**
 * Dispatch to the existing mesh builders by kind. No L-shaped 3D mesh exists for `kitchen_l` /
 * `sofa_l` — they reuse the straight `kitchen_counter` / `sofa` shape, the same simplification
 * already accepted for the 2D renderer.
 */
function buildByKind(
    kind: FixtureKind,
    group: THREE.Group,
    widthM: number,
    depthM: number,
    pos: Point3D,
    reg: MaterialRegistry,
): void {
    switch (kind) {
        case 'kitchen_counter':
        case 'kitchen_l':
            buildKitchenRun(group, widthM, depthM, pos, reg);
            return;
        case 'kitchen_island':
            buildKitchenIsland(group, widthM, depthM, pos, reg);
            return;
        case 'fridge':
            buildRefrigerator(group, pos, reg);
            return;
        case 'dining_table_4':
        case 'dining_table_6':
            buildDiningSet(group, widthM, depthM, pos, reg);
            return;
        case 'sofa':
        case 'sofa_l':
            buildSofa(group, widthM, depthM, pos, reg);
            return;
        case 'low_table':
            buildCoffeeTable(group, widthM, depthM, pos, reg);
            return;
        case 'tv_board':
            buildTvUnit(group, widthM, depthM, pos, reg);
            return;
        case 'bathtub':
            buildBathtub(group, widthM, depthM, pos, reg);
            return;
        case 'vanity':
            buildWashbasin(group, widthM, depthM, pos, reg);
            return;
        case 'washing_machine':
            buildWashingMachine(group, pos, reg);
            return;
        case 'toilet_bowl':
            buildToilet(group, pos, reg);
            return;
        case 'bed_double':
            buildBed(group, widthM, depthM, pos, true, reg);
            return;
        case 'bed_single':
            buildBed(group, widthM, depthM, pos, false, reg);
            return;
        case 'nightstand':
            buildNightstand(group, widthM, depthM, pos, reg);
            return;
        case 'desk':
            buildStudyDesk(group, widthM, depthM, pos, reg);
            return;
        case 'wardrobe':
            buildWardrobe(group, widthM, depthM, pos, reg);
            return;
        case 'shoe_box':
            buildShoesCabinet(group, widthM, depthM, pos, reg);
            return;
    }
}

/**
 * The BDM-mm center and the natural (unrotated) footprint of a fixture, plus the same center
 * converted to Three units — split out as a pure function so both the room-grouping (which
 * needs the mm center, to test against a room polygon) and the position/rotation math (which
 * needs Three units) can be unit-tested without a real THREE.Group or MaterialRegistry.
 */
export function resolveFixturePlacement(fixture: Fixture): {
    readonly kind: FixtureKind;
    readonly widthM: number;
    readonly depthM: number;
    readonly centerMmX: number;
    readonly centerMmY: number;
    readonly centerThreeX: number;
    readonly centerThreeZ: number;
    readonly rotationDeg: 0 | 90 | 180 | 270;
} | null {
    if (!isFixtureKind(fixture.kind)) return null;
    const kind = fixture.kind;
    const rotationDeg = normalizeRotation(fixture.rotation);
    const natural = FIXTURE_CATALOG[kind];
    const rotatedFootprint = fixtureFootprintMm(kind, rotationDeg);
    const centerMmX = fixture.pos.x + rotatedFootprint.widthMm / 2;
    const centerMmY = fixture.pos.y + rotatedFootprint.heightMm / 2;
    return {
        kind,
        widthM: natural.widthMm / 1000,
        depthM: natural.heightMm / 1000,
        centerMmX,
        centerMmY,
        centerThreeX: toThreeX(centerMmX),
        centerThreeZ: toThreeZ(centerMmY),
        rotationDeg,
    };
}

/**
 * Builds one AI/rule-based fixture into `group`, at its own center, facing `rotation` degrees —
 * the exact same data `Plan2dFixtures.tsx` draws in 2D. Unrecognized kinds are skipped rather
 * than crashing (defensive against future/legacy kinds).
 */
export function buildFixtureMesh(
    fixture: Fixture,
    group: THREE.Group,
    elevM: number,
    reg: MaterialRegistry,
): void {
    const placement = resolveFixturePlacement(fixture);
    if (!placement) return;
    const { kind, widthM, depthM, centerThreeX, centerThreeZ, rotationDeg } =
        placement;

    if (rotationDeg === 0) {
        buildByKind(kind, group, widthM, depthM, {
            x: centerThreeX,
            y: elevM,
            z: centerThreeZ,
        }, reg);
        return;
    }

    // Build at the local origin, then rotate and translate the whole sub-assembly as a unit —
    // none of the 18 `buildXxx` functions need to know about rotation this way.
    const sub = new THREE.Group();
    buildByKind(kind, sub, widthM, depthM, { x: 0, y: elevM, z: 0 }, reg);
    sub.rotation.y = (rotationDeg * Math.PI) / 180;
    sub.position.set(centerThreeX, 0, centerThreeZ);
    group.add(sub);
}
