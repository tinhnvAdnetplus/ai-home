import * as THREE from 'three';
import { type Opening } from '@aihome/bdm';
import { buildEntranceCanopy } from './canopy-builder.js';
import { computeSegmentAngle, toThreeX, toThreeY, toThreeZ } from './coords.js';
import { type MaterialRegistry } from './types.js';

type OpeningContext = {
    readonly opening: Opening;
    readonly startMm: number;
    readonly endMm: number;
    readonly wallStart: { readonly x: number; readonly y: number };
    readonly wallVector: { readonly dx: number; readonly dy: number };
    readonly wallLengthMm: number;
    readonly elevationMm: number;
    readonly registry: MaterialRegistry;
};

function addWindowFrame(
    group: THREE.Group,
    w: number,
    h: number,
    reg: MaterialRegistry,
): void {
    const fThick = 0.04;
    const fDepth = 0.07;
    const innerW = Math.max(0.01, w - 2 * fThick);
    const innerH = Math.max(0.01, h - 2 * fThick);

    const glassGeo = new THREE.BoxGeometry(innerW, innerH, 0.015);
    reg.trackGeometry(glassGeo);
    const glass = new THREE.Mesh(glassGeo, reg.glass);
    group.add(glass);

    const hGeo = new THREE.BoxGeometry(w, fThick, fDepth);
    reg.trackGeometry(hGeo);
    const topBar = new THREE.Mesh(hGeo, reg.frame);
    topBar.position.y = (h - fThick) / 2;
    const botBar = new THREE.Mesh(hGeo, reg.frame);
    botBar.position.y = -(h - fThick) / 2;
    group.add(topBar, botBar);

    const vGeo = new THREE.BoxGeometry(fThick, innerH, fDepth);
    reg.trackGeometry(vGeo);
    const leftBar = new THREE.Mesh(vGeo, reg.frame);
    leftBar.position.x = -(w - fThick) / 2;
    const rightBar = new THREE.Mesh(vGeo, reg.frame);
    rightBar.position.x = (w - fThick) / 2;
    group.add(leftBar, rightBar);

    if (w >= 1.4) {
        const mullionGeo = new THREE.BoxGeometry(fThick, innerH, fDepth * 0.9);
        reg.trackGeometry(mullionGeo);
        const mullion = new THREE.Mesh(mullionGeo, reg.frame);
        group.add(mullion);
    }

    // Exterior window sill ledge
    const sillW = w + 0.08;
    const sillH = 0.025;
    const sillD = fDepth + 0.05;
    const sillGeo = new THREE.BoxGeometry(sillW, sillH, sillD);
    reg.trackGeometry(sillGeo);
    const sill = new THREE.Mesh(sillGeo, reg.frame);
    sill.position.set(0, -(h - fThick) / 2 - sillH / 2, 0.025);
    sill.castShadow = true;
    group.add(sill);
}

function addDoorElement(
    group: THREE.Group,
    w: number,
    h: number,
    isEntrance: boolean,
    reg: MaterialRegistry,
): void {
    // Entrance keeps the dark stylish front-door look; an interior swing door is warm wood
    // (near-black read as a flat void in a distant dollhouse view, which this avoids).
    const mat = isEntrance ? reg.door : reg.doorInterior;
    const doorGeo = new THREE.BoxGeometry(w * 0.96, h * 0.98, 0.045);
    reg.trackGeometry(doorGeo);
    const doorMesh = new THREE.Mesh(doorGeo, mat);
    doorMesh.castShadow = true;
    group.add(doorMesh);

    if (isEntrance) {
        // Vertical glass slit on entrance door
        const slitGeo = new THREE.BoxGeometry(0.12, h * 0.65, 0.02);
        reg.trackGeometry(slitGeo);
        const slit = new THREE.Mesh(slitGeo, reg.glass);
        slit.position.set(-w * 0.22, 0, 0.02);
        group.add(slit);
    }

    const handleGeo = new THREE.BoxGeometry(0.025, 0.55, 0.035);
    reg.trackGeometry(handleGeo);
    const handleMesh = new THREE.Mesh(handleGeo, reg.doorHandle);
    handleMesh.position.set(w * 0.38, 0, 0.035);
    group.add(handleMesh);

    if (isEntrance) {
        group.add(buildEntranceCanopy(w, h, 0.07, reg));
    }
}

function addSlidingDoorElement(
    group: THREE.Group,
    w: number,
    h: number,
    reg: MaterialRegistry,
): void {
    // Japanese 引き戸: a thin pale frosted panel flush in the wall, offset to one side
    // (as if half-open), with a small recessed pull groove instead of a protruding handle.
    const panelW = w * 0.58;
    const panelGeo = new THREE.BoxGeometry(panelW, h * 0.98, 0.03);
    reg.trackGeometry(panelGeo);
    const panel = new THREE.Mesh(panelGeo, reg.doorSliding);
    panel.position.set(-w * 0.21, 0, 0);
    panel.castShadow = true;
    group.add(panel);

    const frameGeo = new THREE.BoxGeometry(panelW, 0.05, 0.034);
    reg.trackGeometry(frameGeo);
    const topRail = new THREE.Mesh(frameGeo, reg.frame);
    topRail.position.set(-w * 0.21, h * 0.46, 0);
    const botRail = new THREE.Mesh(frameGeo, reg.frame);
    botRail.position.set(-w * 0.21, -h * 0.46, 0);
    group.add(topRail, botRail);

    const grooveGeo = new THREE.BoxGeometry(0.02, h * 0.4, 0.032);
    reg.trackGeometry(grooveGeo);
    const groove = new THREE.Mesh(grooveGeo, reg.frame);
    groove.position.set(-w * 0.21 + panelW * 0.32, 0, 0.001);
    group.add(groove);
}

export function buildOpeningElement(
    ctx: OpeningContext,
): THREE.Object3D | null {
    const { opening, startMm, endMm, wallStart, wallVector, wallLengthMm } =
        ctx;
    const widthM = (endMm - startMm) * 0.001;
    const heightM = opening.heightMm * 0.001;
    if (widthM <= 0.01 || heightM <= 0.01) return null;

    const midMm = (startMm + endMm) / 2;
    const ratio = midMm / wallLengthMm;
    const cxMm = wallStart.x + wallVector.dx * ratio;
    const cyMm = wallStart.y + wallVector.dy * ratio;
    const bottomM = toThreeY(ctx.elevationMm + opening.sillMm);

    const group = new THREE.Group();
    const rotY = computeSegmentAngle(
        wallVector.dx * 0.001,
        -wallVector.dy * 0.001,
    );

    const isWindow =
        opening.kind === 'window' || opening.kind === 'largeWindow';
    if (isWindow) {
        addWindowFrame(group, widthM, heightM, ctx.registry);
    } else if (opening.kind === 'slidingDoor') {
        addSlidingDoorElement(group, widthM, heightM, ctx.registry);
    } else {
        const isEntrance = opening.kind === 'entrance';
        addDoorElement(group, widthM, heightM, isEntrance, ctx.registry);
    }

    group.position.set(toThreeX(cxMm), bottomM + heightM / 2, toThreeZ(cyMm));
    group.rotation.y = rotY;

    return group;
}
