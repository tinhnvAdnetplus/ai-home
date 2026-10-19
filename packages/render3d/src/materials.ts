import * as THREE from 'three';
import {
    createRoofStandingSeamTexture,
    createSidingTexture,
} from './textures.js';
import { type MaterialOptions, type MaterialRegistry } from './types.js';

export const DEFAULT_WALL_COLOR = '#5f5a57';
export const DEFAULT_ROOF_COLOR = '#2b2d31';
export const DEFAULT_FLOOR_COLOR = '#c9a678';

function createColor(hex: string | undefined, fallback: string): THREE.Color {
    return new THREE.Color(hex ?? fallback);
}

export function createMaterialRegistry(
    options?: MaterialOptions,
): MaterialRegistry {
    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const textures: THREE.Texture[] = [];

    function trackMat<T extends THREE.Material>(mat: T): T {
        materials.push(mat);
        return mat;
    }

    function trackTex<T extends THREE.Texture>(tex: T): T {
        textures.push(tex);
        return tex;
    }

    function std(
        color: THREE.ColorRepresentation,
        roughness: number,
        metalness = 0,
        isTransparent = false,
        opacity = 1,
        map?: THREE.Texture,
    ): THREE.MeshStandardMaterial {
        return trackMat(
            new THREE.MeshStandardMaterial({
                color,
                roughness,
                metalness,
                transparent: isTransparent,
                opacity,
                map: map ?? null,
            }),
        );
    }

    const hasCustomWall = options?.wall !== undefined;
    const wallColor = hasCustomWall
        ? new THREE.Color(options.wall)
        : new THREE.Color(DEFAULT_WALL_COLOR);
    const altWallColor =
        options?.accent !== undefined
            ? new THREE.Color(options.accent)
            : hasCustomWall
              ? new THREE.Color(options.wall).offsetHSL(0, -0.05, 0.18)
              : new THREE.Color('#dedcd6');

    const hasCustomRoof = options?.roof !== undefined;
    const roofColor = hasCustomRoof
        ? new THREE.Color(options.roof)
        : new THREE.Color(DEFAULT_ROOF_COLOR);

    const floorColor = createColor(options?.floor, DEFAULT_FLOOR_COLOR);

    const sidingTex = trackTex(createSidingTexture(false));
    const sidingAltTex = trackTex(createSidingTexture(true));
    const roofTex = trackTex(createRoofStandingSeamTexture());

    return {
        wallExterior: std(wallColor, 0.75, 0.04, false, 1, sidingTex),
        wallExteriorAlt: std(altWallColor, 0.8, 0.03, false, 1, sidingAltTex),
        wallInterior: std('#f7f5f0', 0.9),
        woodAccent: std('#c48950', 0.58, 0.05),
        roof: std(roofColor, 0.45, 0.08, false, 1, roofTex),
        fascia: std('#242830', 0.5, 0.15),
        beltLine: std('#242830', 0.5, 0.15),
        foundation: std('#c5c8cc', 0.88, 0.02),
        skirtAO: std('#1e2024', 0.95, 0),
        floorDefault: std(floorColor, 0.45, 0.05),
        floorTatami: std('#bdc599', 0.85),
        floorTile: std('#dee3de', 0.35, 0.05),
        floorBalcony: std('#b8b5ad', 0.7, 0.1),
        glass: std('#a5d0eb', 0.1, 0.25, true, 0.65),
        frame: std('#f6f7f9', 0.25, 0.05),
        door: std('#23201e', 0.55, 0.08),
        doorInterior: std('#8a6240', 0.6, 0.04),
        doorSliding: std('#f3f1ea', 0.5, 0.02, true, 0.92),
        doorHandle: std('#d2d7dc', 0.2, 0.7),
        stair: std(floorColor, 0.5, 0.05),
        siteGround: std('#b7d99a', 0.9),
        boundaryLine: trackMat(
            new THREE.LineBasicMaterial({ color: '#687962' }),
        ),
        curb: std('#bcc1c8', 0.8),
        paving: std('#dedbd2', 0.75, 0.05),
        road: std('#686d73', 0.86, 0.04),
        roadLine: std('#ffffff', 0.3),
        parking: std('#cfd4d8', 0.7, 0.02),
        carportFrame: std('#454b54', 0.4, 0.6),
        carportRoof: std('#9ec2e0', 0.2, 0, true, 0.5),
        carBody: std('#5b7fb3', 0.25, 0.35),
        carGlass: std('#283240', 0.1, 0.2, true, 0.85),
        carTire: std('#1e2022', 0.9, 0.02),
        carWheel: std('#cbd5e1', 0.3, 0.5),
        treeTrunk: std('#684832', 0.85),
        treeFoliage: std('#8ccf6b', 0.85),
        treeFoliageDark: std('#6fb85a', 0.85),
        shrub: std('#78be5e', 0.85),
        fence: std('#3a4047', 0.55, 0.1),
        fixtureCounter: std('#eaeced', 0.3, 0.3),
        fixtureCeramic: std('#ffffff', 0.2, 0.05),
        fixtureFabric: std('#758494', 0.9),
        fixtureWood: std('#8a5d37', 0.6, 0.05),
        northArrow: std('#0b6bdc', 0.3, 0.2),
        trackGeometry: (geo: THREE.BufferGeometry) => {
            geometries.push(geo);
        },
        disposeAll: () => {
            for (const geo of geometries) geo.dispose();
            for (const mat of materials) mat.dispose();
            for (const tex of textures) tex.dispose();
        },
    };
}
