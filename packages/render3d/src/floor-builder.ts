import * as THREE from 'three';
import { type Floor, type Polygon } from '@aihome/bdm';
import { toThreeY } from './coords.js';
import {
    applyWorldUv,
    getProceduralFloorMaterial,
} from './furniture-floor-textures.js';
import { type MaterialRegistry, type Render3dOptions } from './types.js';

/**
 * Plan polygon as a Shape in metres. `ySign` = +1 for a slab that is then turned up with
 * rotateX(-PI/2) (shape (x, y) -> world (x, 0, -y)); -1 for a ceiling turned down with
 * rotateX(+PI/2) (shape (x, -y) -> world (x, 0, -y), front face pointing down). Either way the
 * world position is the canonical -> Three mapping of coords.ts.
 */
function buildPolygonShape(
    poly: Polygon,
    ySign: 1 | -1 = 1,
): THREE.Shape | null {
    if (poly.length < 3) return null;
    const shape = new THREE.Shape();
    const first = poly[0];
    if (!first) return null;

    shape.moveTo(first.x * 0.001, ySign * first.y * 0.001);
    for (let i = 1; i < poly.length; i += 1) {
        const pt = poly[i];
        if (pt) shape.lineTo(pt.x * 0.001, ySign * pt.y * 0.001);
    }
    shape.closePath();
    return shape;
}

export function buildFloorSlabs(
    floor: Floor,
    registry: MaterialRegistry,
    options?: Render3dOptions,
): THREE.Group {
    const group = new THREE.Group();
    const floorY = toThreeY(floor.elevationMm) + 0.005;
    const isCeiling = options?.isCeilingVisible ?? false;

    for (const room of floor.rooms) {
        const isStairwell = room.type === 'stairs';
        // upper floors: the stair room is the stairwell opening (no slab)
        if (isStairwell && floor.level > 1) continue;
        const shape = buildPolygonShape(room.polygon);
        if (!shape) continue;

        const geo = new THREE.ShapeGeometry(shape);
        applyWorldUv(geo, 1.2);
        geo.rotateX(-Math.PI / 2);
        registry.trackGeometry(geo);

        const mat = getProceduralFloorMaterial(room.type, registry);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = `slab-${room.id}`;
        mesh.position.y = floorY;
        mesh.receiveShadow = true;
        group.add(mesh);

        const ceilShape =
            isCeiling && !isStairwell
                ? buildPolygonShape(room.polygon, -1)
                : null;
        if (ceilShape) {
            const ceilGeo = new THREE.ShapeGeometry(ceilShape);
            ceilGeo.rotateX(Math.PI / 2);
            registry.trackGeometry(ceilGeo);
            const ceilMesh = new THREE.Mesh(ceilGeo, registry.wallInterior);
            ceilMesh.name = `ceiling-${room.id}`;
            ceilMesh.position.y =
                toThreeY(floor.elevationMm + floor.heightMm) - 0.005;
            group.add(ceilMesh);
        }
    }

    return group;
}
