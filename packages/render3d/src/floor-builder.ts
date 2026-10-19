import * as THREE from 'three';
import { type Floor, type Polygon } from '@aihome/bdm';
import { toThreeY } from './coords.js';
import {
    applyWorldUv,
    getProceduralFloorMaterial,
} from './furniture-floor-textures.js';
import { type MaterialRegistry, type Render3dOptions } from './types.js';

function buildPolygonShape(poly: Polygon): THREE.Shape | null {
    if (poly.length < 3) return null;
    const shape = new THREE.Shape();
    const first = poly[0];
    if (!first) return null;

    shape.moveTo(first.x * 0.001, first.y * 0.001);
    for (let i = 1; i < poly.length; i += 1) {
        const pt = poly[i];
        if (pt) shape.lineTo(pt.x * 0.001, pt.y * 0.001);
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
        mesh.position.y = floorY;
        mesh.receiveShadow = true;
        group.add(mesh);

        if (isCeiling && !isStairwell) {
            const ceilGeo = new THREE.ShapeGeometry(shape);
            ceilGeo.rotateX(Math.PI / 2);
            registry.trackGeometry(ceilGeo);
            const ceilMesh = new THREE.Mesh(ceilGeo, registry.wallInterior);
            ceilMesh.position.y =
                toThreeY(floor.elevationMm + floor.heightMm) - 0.005;
            group.add(ceilMesh);
        }
    }

    return group;
}
