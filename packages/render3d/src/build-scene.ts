import * as THREE from 'three';
import { type BuildingModel, type Floor } from '@aihome/bdm';
import { buildBalconyRails } from './balcony-builder.js';
import { computeSceneBounds } from './bounds.js';
import {
    createDollhouseCutawayContext,
    type DollhouseCutawayContext,
} from './dollhouse-cutaway.js';
import { buildPaleBaseFloor } from './dollhouse-pale-base.js';
import { buildDollhouseFloorWalls } from './dollhouse-wall-builder.js';
import { buildFloorFixtures } from './fixture-builder.js';
import { buildFloorSlabs } from './floor-builder.js';
import { createMaterialRegistry } from './materials.js';
import { buildRoof } from './roof-builder.js';
import { buildSite } from './site-builder.js';
import { computeFloorCenter, findLdkInfo } from './ldk-info.js';
import { buildFloorStairs } from './stair-builder.js';
import {
    type BuildSceneResult,
    type MaterialRegistry,
    type Render3dOptions,
} from './types.js';
import { buildFloorWalls } from './wall-builder.js';

function buildDollhouseFloorGroup(
    floor: Floor,
    reg: MaterialRegistry,
    cutawayCtx: DollhouseCutawayContext,
    bCenter: THREE.Vector3,
    opts?: Render3dOptions,
    hasEntranceLattice = true,
): THREE.Group {
    const fGroup = new THREE.Group();
    fGroup.name = `floor-${String(floor.level)}`;
    fGroup.add(buildFloorSlabs(floor, reg, { isCeilingVisible: false }));
    fGroup.add(
        buildDollhouseFloorWalls(floor, reg, cutawayCtx, bCenter, hasEntranceLattice),
    );
    fGroup.add(buildFloorStairs(floor, reg));
    if (opts?.isFurnitureVisible ?? true)
        fGroup.add(buildFloorFixtures(floor, reg));
    const rails = buildBalconyRails(floor, reg);
    if (rails) fGroup.add(rails);
    return fGroup;
}

function buildStandardFloorGroup(
    floor: Floor,
    reg: MaterialRegistry,
    opts?: Render3dOptions,
    hasEntranceLattice = true,
): THREE.Group {
    const fGroup = new THREE.Group();
    fGroup.name = `floor-${String(floor.level)}`;
    fGroup.add(buildFloorSlabs(floor, reg, opts));
    fGroup.add(buildFloorWalls(floor, reg, hasEntranceLattice));
    fGroup.add(buildFloorStairs(floor, reg));
    if (opts?.isFurnitureVisible ?? true)
        fGroup.add(buildFloorFixtures(floor, reg));
    const rails = buildBalconyRails(floor, reg);
    if (rails) fGroup.add(rails);
    return fGroup;
}

export function buildScene(
    model: BuildingModel,
    options?: Render3dOptions,
): BuildSceneResult {
    const registry = createMaterialRegistry(options?.materials);
    const scene = new THREE.Group();
    scene.name = 'building-root';
    const bGroup = new THREE.Group();
    bGroup.name = 'house-structure';

    const cutawayLevel =
        options?.dollhouseFloorLevel ?? options?.maxFloorLevel ?? null;
    const isDollhouse = cutawayLevel !== null;
    const baseFloor = model.floors[0];
    const bCenter = baseFloor
        ? computeFloorCenter(baseFloor)
        : new THREE.Vector3();
    const cutawayCtx = isDollhouse
        ? createDollhouseCutawayContext(bCenter)
        : null;

    const hasEntranceLattice = model.exterior?.hasEntranceLattice ?? true;
    if (cutawayLevel !== null) {
        for (const floor of model.floors) {
            if (floor.level < cutawayLevel) {
                bGroup.add(buildPaleBaseFloor(floor, registry));
            } else if (floor.level === cutawayLevel && cutawayCtx) {
                bGroup.add(
                    buildDollhouseFloorGroup(
                        floor,
                        registry,
                        cutawayCtx,
                        bCenter,
                        options,
                        hasEntranceLattice,
                    ),
                );
            }
        }
    } else {
        for (const floor of model.floors) {
            bGroup.add(
                buildStandardFloorGroup(
                    floor,
                    registry,
                    options,
                    hasEntranceLattice,
                ),
            );
        }
    }

    if ((options?.isRoofVisible ?? true) && !isDollhouse) {
        const roofGroup = buildRoof(model, registry);
        roofGroup.name = 'roof';
        bGroup.add(roofGroup);
    }
    scene.add(bGroup);

    if (options?.isSiteVisible ?? true) {
        const siteGroup = buildSite(model, registry);
        siteGroup.name = 'site';
        scene.add(siteGroup);
    }

    const buildingBounds = computeSceneBounds(bGroup);
    const sceneBounds = computeSceneBounds(scene);
    const ldkInfo = findLdkInfo(baseFloor);

    return {
        scene,
        bounds: buildingBounds,
        sceneBounds,
        ldkCenter: ldkInfo?.center,
        ldkFacing: ldkInfo?.facing ?? { x: 0, y: 0, z: 1 },
        updateCameraAzimuth: (camPos: THREE.Vector3) => {
            cutawayCtx?.update(camPos);
        },
        dispose: () => {
            cutawayCtx?.dispose();
            registry.disposeAll();
            scene.clear();
        },
    };
}
