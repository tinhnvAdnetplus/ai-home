import * as THREE from 'three';
import { computeSegmentAngle, toThreeX, toThreeY, toThreeZ } from './coords.js';
import { type MaterialRegistry } from './types.js';

type EntranceAccentContext = {
    readonly wallStart: { readonly x: number; readonly y: number };
    readonly wallVector: { readonly dx: number; readonly dy: number };
    readonly wallLengthMm: number;
    readonly wallThicknessM: number;
    readonly floorHeightM: number;
    readonly elevationMm: number;
    readonly entranceOffsetMm: number;
    readonly entranceWidthMm: number;
    readonly registry: MaterialRegistry;
};

export function buildEntranceLattice(
    ctx: EntranceAccentContext,
): THREE.Group | null {
    const {
        wallStart,
        wallVector,
        wallLengthMm,
        wallThicknessM,
        floorHeightM,
        elevationMm,
        entranceOffsetMm,
        entranceWidthMm,
        registry,
    } = ctx;

    const doorEndMm = entranceOffsetMm + entranceWidthMm;
    const spaceRight = wallLengthMm - doorEndMm;
    const spaceLeft = entranceOffsetMm;

    let panelWidthMm = 1800;
    let panelStartMm = 0;

    if (spaceRight >= 1400) {
        panelWidthMm = Math.min(1800, spaceRight - 100);
        panelStartMm = doorEndMm + 80;
    } else if (spaceLeft >= 1400) {
        panelWidthMm = Math.min(1800, spaceLeft - 100);
        panelStartMm = Math.max(0, entranceOffsetMm - 80 - panelWidthMm);
    } else if (spaceRight >= spaceLeft && spaceRight > 600) {
        panelWidthMm = Math.min(1800, spaceRight - 80);
        panelStartMm = doorEndMm + 40;
    } else if (spaceLeft > 600) {
        panelWidthMm = Math.min(1800, spaceLeft - 80);
        panelStartMm = Math.max(0, entranceOffsetMm - 40 - panelWidthMm);
    } else {
        return null;
    }

    const pwM = panelWidthMm * 0.001;
    if (pwM <= 0.3) return null;

    const midMm = panelStartMm + panelWidthMm / 2;
    const ratio = midMm / wallLengthMm;
    const cxMm = wallStart.x + wallVector.dx * ratio;
    const cyMm = wallStart.y + wallVector.dy * ratio;
    const rotY = computeSegmentAngle(
        wallVector.dx * 0.001,
        -wallVector.dy * 0.001,
    );

    const group = new THREE.Group();
    const plinthHM = 0.3;
    const panelHM = floorHeightM - plinthHM;
    const panelBottomM = toThreeY(elevationMm) + plinthHM;

    // Dark espresso wood backing board for contrast behind the slats
    const backGeo = new THREE.BoxGeometry(pwM, panelHM, 0.02);
    registry.trackGeometry(backGeo);
    const backMesh = new THREE.Mesh(backGeo, registry.skirtAO);
    backMesh.position.set(0, 0, wallThicknessM / 2 + 0.01);
    group.add(backMesh);

    // Top and bottom horizontal trim rails in warm wood
    const railGeo = new THREE.BoxGeometry(pwM, 0.04, 0.04);
    registry.trackGeometry(railGeo);
    const topRail = new THREE.Mesh(railGeo, registry.woodAccent);
    topRail.position.set(0, panelHM / 2 - 0.02, wallThicknessM / 2 + 0.03);
    const botRail = new THREE.Mesh(railGeo, registry.woodAccent);
    botRail.position.set(0, -panelHM / 2 + 0.02, wallThicknessM / 2 + 0.03);
    group.add(topRail, botRail);

    // Warm-wood vertical slats (louvers)
    const slatSpacing = 0.085;
    const slatCount = Math.max(4, Math.floor(pwM / slatSpacing));
    const slatW = 0.032;
    const slatD = 0.042;
    const slatH = panelHM - 0.08;

    const slatGeo = new THREE.BoxGeometry(slatW, slatH, slatD);
    registry.trackGeometry(slatGeo);

    for (let i = 0; i < slatCount; i += 1) {
        const sx = -pwM / 2 + (i + 0.5) * (pwM / slatCount);
        const slatMesh = new THREE.Mesh(slatGeo, registry.woodAccent);
        slatMesh.position.set(sx, 0, wallThicknessM / 2 + 0.02 + slatD / 2);
        slatMesh.castShadow = true;
        group.add(slatMesh);
    }

    group.position.set(
        toThreeX(cxMm),
        panelBottomM + panelHM / 2,
        toThreeZ(cyMm),
    );
    group.rotation.y = rotY;

    return group;
}
