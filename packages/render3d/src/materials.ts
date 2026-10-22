import * as THREE from 'three';
import { type SurfaceSpec, resolvePalette } from './palette.js';
import { roofTexture, wallTexture } from './textures-finish.js';
import { type MaterialOptions, type MaterialRegistry } from './types.js';

// Fallbacks of the default (modern) palette, kept as exports for existing consumers.
export const DEFAULT_WALL_COLOR = resolvePalette().wall.color;
export const DEFAULT_ROOF_COLOR = resolvePalette().roof.color;
export const DEFAULT_FLOOR_COLOR = resolvePalette().floor.color;

export function createMaterialRegistry(
    options?: MaterialOptions,
): MaterialRegistry {
    const materials: THREE.Material[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const textures: THREE.Texture[] = [];
    const palette = resolvePalette(options);

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

    const fromSpec = (
        spec: SurfaceSpec,
        map?: THREE.Texture,
    ): THREE.MeshStandardMaterial =>
        std(spec.color, spec.roughness, spec.metalness, false, 1, map);

    const wallTex = trackTex(wallTexture(palette, false));
    const wallAltTex = trackTex(wallTexture(palette, true));
    const roofTex = trackTex(roofTexture(palette));

    // Glazing: transparent, no depth write so panes behind panes are not punched out.
    const glass = std(
        palette.glazing.color,
        palette.glazing.roughness,
        palette.glazing.metalness,
        true,
        palette.glazing.opacity,
    );
    glass.depthWrite = false;
    const carGlass = std('#2c343d', 0.1, 0.1, true, 0.85);
    carGlass.depthWrite = false;
    const carportRoof = std('#b9c7d2', 0.25, 0, true, 0.5);
    carportRoof.depthWrite = false;

    return {
        palette,
        wallExterior: fromSpec(palette.wall, wallTex),
        wallExteriorAlt: fromSpec(palette.wallAccent, wallAltTex),
        wallInterior: std('#f5f3ee', 0.9),
        woodAccent: fromSpec(palette.timber),
        roof: fromSpec(palette.roof, roofTex),
        fascia: fromSpec(palette.trim),
        beltLine: fromSpec(palette.trim),
        foundation: fromSpec(palette.foundation),
        skirtAO: std('#2a2b2d', 0.95, 0),
        floorDefault: fromSpec(palette.floor),
        floorTatami: std('#bdc599', 0.85),
        floorTile: std('#dee3de', 0.35, 0.05),
        floorBalcony: std('#b8b5ad', 0.7, 0.1),
        glass,
        frame: fromSpec(palette.windowFrame),
        door: fromSpec(palette.entranceDoor),
        doorInterior: fromSpec(palette.interiorDoor),
        doorSliding: std('#f3f1ea', 0.5, 0.02, true, 0.92),
        doorHandle: fromSpec(palette.metal),
        stair: std(palette.floor.color, 0.5, 0.02),
        siteGround: std('#a9c38c', 0.92),
        boundaryLine: trackMat(
            new THREE.LineBasicMaterial({ color: '#687962' }),
        ),
        curb: std('#bcc1c8', 0.8),
        paving: std('#d9d5cb', 0.8, 0.02),
        road: std('#6a6e73', 0.88, 0.02),
        roadLine: std('#f2f2f0', 0.4),
        parking: std('#cdd0d2', 0.75, 0.02),
        carportFrame: std('#4b5058', 0.45, 0.35),
        carportRoof,
        carBody: std('#8b9097', 0.35, 0.25),
        carGlass,
        carTire: std('#1e2022', 0.9, 0.02),
        carWheel: std('#c4c9cf', 0.35, 0.35),
        treeTrunk: std('#6a4c36', 0.88),
        treeFoliage: std('#6d9450', 0.86),
        treeFoliageDark: std('#587f40', 0.86),
        shrub: std('#6b9752', 0.86),
        fence: std('#3f444a', 0.6, 0.08),
        fixtureCounter: std('#eaeced', 0.3, 0.2),
        fixtureCeramic: std('#ffffff', 0.2, 0.05),
        fixtureFabric: std('#7c8794', 0.9),
        fixtureWood: fromSpec(palette.timber),
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
