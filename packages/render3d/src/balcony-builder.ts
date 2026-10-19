import * as THREE from 'three';
import { type Floor, type Point, type Wall } from '@aihome/bdm';
import { computeSegmentAngle, toThreeX, toThreeY, toThreeZ } from './coords.js';
import { type MaterialRegistry } from './types.js';

function hasWallAlongEdge(
    p1: Point,
    p2: Point,
    walls: readonly Wall[],
): boolean {
    const edgeMidX = (p1.x + p2.x) / 2;
    const edgeMidY = (p1.y + p2.y) / 2;
    for (const w of walls) {
        const wallMidX = (w.a.x + w.b.x) / 2;
        const wallMidY = (w.a.y + w.b.y) / 2;
        const dist = Math.hypot(edgeMidX - wallMidX, edgeMidY - wallMidY);
        if (dist < 150) return true;
    }
    return false;
}

export function buildBalconyRails(
    floor: Floor,
    reg: MaterialRegistry,
): THREE.Group | null {
    const balconyRooms = floor.rooms.filter(
        (r) => r.type === 'balcony' || r.type === 'porch',
    );
    if (balconyRooms.length === 0) return null;

    const group = new THREE.Group();
    const railHM = 1.05;
    const baseYM = toThreeY(floor.elevationMm);

    for (const room of balconyRooms) {
        const poly = room.polygon;
        if (poly.length < 3) continue;

        for (let j = 0; j < poly.length; j += 1) {
            const p1 = poly[j];
            const p2 = poly[(j + 1) % poly.length];
            if (!p1 || !p2) continue;

            if (hasWallAlongEdge(p1, p2, floor.walls)) continue;

            const dx = (p2.x - p1.x) * 0.001;
            const dy = (p2.y - p1.y) * 0.001;
            const edgeLenM = Math.hypot(dx, dy);
            if (edgeLenM < 0.2) continue;

            const midX = (p1.x + p2.x) * 0.5;
            const midY = (p1.y + p2.y) * 0.5;
            const rotY = computeSegmentAngle(dx, -dy);

            const edgeGroup = new THREE.Group();

            // Top handrail
            const topGeo = new THREE.BoxGeometry(edgeLenM, 0.05, 0.06);
            reg.trackGeometry(topGeo);
            const topRail = new THREE.Mesh(topGeo, reg.fascia);
            topRail.position.y = railHM - 0.025;
            edgeGroup.add(topRail);

            // Bottom base rail
            const botGeo = new THREE.BoxGeometry(edgeLenM, 0.04, 0.04);
            reg.trackGeometry(botGeo);
            const botRail = new THREE.Mesh(botGeo, reg.fascia);
            botRail.position.y = 0.04;
            edgeGroup.add(botRail);

            // Safety glass infill panel
            const glassGeo = new THREE.BoxGeometry(
                Math.max(0.01, edgeLenM - 0.04),
                railHM - 0.12,
                0.015,
            );
            reg.trackGeometry(glassGeo);
            const glass = new THREE.Mesh(glassGeo, reg.glass);
            glass.position.y = railHM / 2;
            edgeGroup.add(glass);

            // Corner post
            const postGeo = new THREE.BoxGeometry(0.045, railHM, 0.045);
            reg.trackGeometry(postGeo);
            const post = new THREE.Mesh(postGeo, reg.fascia);
            post.position.set(-edgeLenM / 2, railHM / 2, 0);
            edgeGroup.add(post);

            edgeGroup.position.set(toThreeX(midX), baseYM, toThreeZ(midY));
            edgeGroup.rotation.y = rotY;
            group.add(edgeGroup);
        }
    }

    return group.children.length > 0 ? group : null;
}
