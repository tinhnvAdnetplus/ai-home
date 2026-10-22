import * as THREE from 'three';
import { type BuildingModel } from '@aihome/bdm';
import { type FloorWallBox, computeFloorWallBox } from './roof-wall-box.js';
import {
    type RoofBounds,
    buildFlatRoofMesh,
    buildGableRoofMesh,
    buildHippedRoofMesh,
} from './roof-shapes.js';
import { buildShedRoofMesh } from './roof-shed.js';
import { type MaterialRegistry } from './types.js';

function addLowerRoofExtensions(
    group: THREE.Group,
    b1: FloorWallBox,
    b2: FloorWallBox,
    ov: number,
    reg: MaterialRegistry,
): void {
    const yBase = b1.yTop - 0.12;
    if (b1.minZ < b2.minZ - 0.15) {
        group.add(
            buildFlatRoofMesh(
                { x1: b1.minX - ov, x2: b1.maxX + ov, z1: b1.minZ - ov, z2: b2.minZ + 0.05, yBase },
                reg,
                false,
            ),
        );
    }
    if (b1.maxZ > b2.maxZ + 0.15) {
        group.add(
            buildFlatRoofMesh(
                { x1: b1.minX - ov, x2: b1.maxX + ov, z1: b2.maxZ - 0.05, z2: b1.maxZ + ov, yBase },
                reg,
                false,
            ),
        );
    }
    const z1Clamp = Math.max(b1.minZ, b2.minZ) - ov;
    const z2Clamp = Math.min(b1.maxZ, b2.maxZ) + ov;
    if (b1.minX < b2.minX - 0.15 && z2Clamp > z1Clamp) {
        group.add(
            buildFlatRoofMesh(
                { x1: b1.minX - ov, x2: b2.minX + 0.05, z1: z1Clamp, z2: z2Clamp, yBase },
                reg,
                false,
            ),
        );
    }
    if (b1.maxX > b2.maxX + 0.15 && z2Clamp > z1Clamp) {
        group.add(
            buildFlatRoofMesh(
                { x1: b2.maxX - 0.05, x2: b1.maxX + ov, z1: z1Clamp, z2: z2Clamp, yBase },
                reg,
                false,
            ),
        );
    }
}

export function buildRoof(
    model: BuildingModel,
    registry: MaterialRegistry,
): THREE.Group {
    const group = new THREE.Group();
    if (model.floors.length === 0) return group;
    const topFloor = model.floors[model.floors.length - 1];
    if (!topFloor) return group;
    const topBox = computeFloorWallBox(topFloor);
    if (!topBox) return group;

    const overhangMm = model.roof.overhangMm;
    const overhangM = (overhangMm > 0 ? overhangMm : 600) * 0.001;
    const bounds: RoofBounds = {
        x1: topBox.minX - overhangM,
        x2: topBox.maxX + overhangM,
        z1: topBox.minZ - overhangM,
        z2: topBox.maxZ + overhangM,
        yBase: topBox.yTop,
        overhang: overhangM,
        wall: topBox.faces,
    };

    const pitch = model.roof.pitch > 0 ? model.roof.pitch : 4;
    const slope = pitch / 10;
    if (model.roof.kind === 'flat') {
        group.add(buildFlatRoofMesh(bounds, registry));
    } else if (model.roof.kind === 'hipped') {
        group.add(buildHippedRoofMesh(bounds, slope, registry));
    } else if (model.roof.kind === 'shed') {
        group.add(buildShedRoofMesh(bounds, slope, registry));
    } else {
        group.add(buildGableRoofMesh(bounds, slope, registry));
    }

    if (model.floors.length >= 2 && model.floors[0]) {
        const b1 = computeFloorWallBox(model.floors[0]);
        if (b1) {
            addLowerRoofExtensions(group, b1, topBox, Math.min(overhangM, 0.45), registry);
        }
    }
    return group;
}

