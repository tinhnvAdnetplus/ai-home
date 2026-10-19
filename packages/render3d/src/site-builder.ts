import * as THREE from 'three';
import { type BuildingModel } from '@aihome/bdm';
import { createContactShadowContext } from './contact-shadow.js';
import { toThreeX, toThreeZ } from './coords.js';
import { buildWoodDeck } from './deck-builder.js';
import { buildEntranceElements } from './entrance-builder.js';
import { buildFenceLine } from './fence-builder.js';
import { createFoliageContext } from './foliage-builder.js';
import { buildHorizon } from './horizon-builder.js';
import { buildLawn } from './lawn-builder.js';
import { buildNeighbours } from './neighbour-builder.js';
import { buildParkingArea } from './parking-builder.js';
import { buildRoad } from './road-builder.js';
import { computeExtents, findEntrancePos, polygonToGroundBox } from './site-extents.js';
import { planSite } from './site-plan.js';
import { houseGround, planShrubs, planTrees } from './site-shrubs.js';
import { type MaterialRegistry } from './types.js';

export function buildSite(
    model: BuildingModel,
    reg: MaterialRegistry,
): THREE.Group {
    const group = new THREE.Group();
    group.name = 'site-environment';
    const shadowCtx = createContactShadowContext();

    const ext = computeExtents(model);
    const midX = (ext.minX + ext.maxX) / 2;
    const midZ = (ext.minZ + ext.maxZ) / 2;
    const lotDepth = Math.max(8, ext.maxZ - ext.minZ);
    const lotWidth = Math.max(8, ext.maxX - ext.minX);

    const hW = ext.houseMaxX - ext.houseMinX + 1.2;
    const hD = lotDepth * 0.72;
    const houseShadow = shadowCtx.createShadowMesh(hW, hD, 0.42);
    houseShadow.position.set((ext.houseMinX + ext.houseMaxX) / 2, 0.003, midZ);
    group.add(houseShadow);

    const lawn = buildLawn(midX, midZ, lotWidth, lotDepth, reg);
    const roadW = 6.0;
    const spanX = Math.max(lotWidth + 24.0, 48.0);
    const road = buildRoad(midX, spanX, ext.maxZ, roadW, reg);
    const neighbours = buildNeighbours(ext.minX, ext.maxX, ext.minZ, ext.maxZ, reg);
    const horizon = buildHorizon(midX, midZ, reg);
    const ent = findEntrancePos(model);
    const house = {
        minX: ext.houseMinX,
        maxX: ext.houseMaxX,
        minZ: ext.houseMinZ,
        maxZ: ext.houseMaxZ,
    };
    const lot = {
        minX: ext.minX,
        maxX: ext.maxX,
        minZ: ext.minZ,
        maxZ: ext.maxZ,
    };
    const bdmPad = polygonToGroundBox(model.parking.polygon);
    const plan = planSite({
        lot,
        house,
        entX: ent.x,
        spaces: model.parking.spaces,
        kind: model.parking.kind,
        parkingOverride: bdmPad ?? undefined,
    });
    const entrance = buildEntranceElements(ent.x, ent.z, ext.maxZ, plan.gatePostX, reg);
    const pad = plan.parking;
    const parking = pad
        ? buildParkingArea(
              { ...model.parking, spaces: plan.spaces },
              (pad.minX + pad.maxX) / 2,
              (pad.minZ + pad.maxZ) / 2,
              pad.maxZ - pad.minZ,
              reg,
              pad.maxX - pad.minX,
          )
        : null;
    const deck = buildWoodDeck(model.exterior?.deckPolygon, reg);
    if (deck) group.add(deck);

    const foliage = createFoliageContext(reg);
    const deckBox = polygonToGroundBox(model.exterior?.deckPolygon, 0.25);
    const planted = [...plan.keepClear, ...(deckBox ? [deckBox] : []), houseGround(house)];
    if (model.exterior?.trees !== undefined) {
        for (const t of model.exterior.trees) {
            const size = Math.max(0.85, Math.min(1.25, t.radiusMm / 750));
            foliage.addTree(group, toThreeX(t.pos.x), toThreeZ(t.pos.y), size);
        }
    } else {
        for (const t of planTrees(lot, planted)) {
            foliage.addTree(group, t.x, t.z, t.size);
        }
    }

    const farRoadZ = ext.maxZ + 1.4 + 0.16 + roadW + 1.2;
    foliage.addTree(group, midX - 9.0, farRoadZ, 1.2);
    foliage.addTree(group, midX + 8.5, farRoadZ, 1.15);
    foliage.addShrub(group, midX - 4.0, farRoadZ, 0.45, true);
    foliage.addShrub(group, midX + 3.5, farRoadZ, 0.42, false);

    for (const sh of planShrubs(lot, planted)) {
        foliage.addShrub(group, sh.x, sh.z, sh.size, sh.isBerry);
    }

    group.add(
        lawn.group,
        road.group,
        neighbours.group,
        horizon.group,
        entrance.group,
        buildFenceLine(ext.minX, ext.maxZ, ext.minX, ext.minZ, reg),
        buildFenceLine(ext.minX, ext.minZ, ext.maxX, ext.minZ, reg),
        buildFenceLine(ext.maxX, ext.minZ, ext.maxX, ext.maxZ, reg),
    );
    if (parking) group.add(parking.group);

    group.userData.dispose = () => {
        shadowCtx.dispose();
        lawn.dispose();
        road.dispose();
        neighbours.dispose();
        horizon.dispose();
        entrance.dispose();
        foliage.dispose();
        parking?.dispose();
    };

    return group;
}

