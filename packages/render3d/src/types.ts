import type * as THREE from 'three';
import {
    type ArchitecturalPalette,
    type ArchitecturalStyle,
} from './palette.js';

/** Explicit colour choices (hex) override the style preset of `palette.ts` slot by slot. */
export type MaterialOptions = {
    readonly wall?: string | undefined;
    readonly roof?: string | undefined;
    readonly floor?: string | undefined;
    readonly accent?: string | undefined;
    /** Exterior style; selects the fallback palette and wall/roof finishes. */
    readonly style?: ArchitecturalStyle | undefined;
};

export type Render3dOptions = {
    readonly materials?: MaterialOptions | undefined;
    readonly maxFloorLevel?: number | undefined;
    readonly dollhouseFloorLevel?: number | null | undefined;
    readonly isCeilingVisible?: boolean | undefined;
    readonly isFurnitureVisible?: boolean | undefined;
    readonly isSiteVisible?: boolean | undefined;
    readonly isRoofVisible?: boolean | undefined;
};

export type Point3D = {
    readonly x: number;
    readonly y: number;
    readonly z: number;
};

export type SceneBounds = {
    readonly min: Point3D;
    readonly max: Point3D;
    readonly center: Point3D;
    readonly size: Point3D;
};

export type MaterialRegistry = {
    /** The resolved semantic palette every material below was created from. */
    readonly palette: ArchitecturalPalette;
    readonly wallExterior: THREE.Material;
    readonly wallExteriorAlt: THREE.Material;
    readonly wallInterior: THREE.Material;
    readonly woodAccent: THREE.Material;
    readonly roof: THREE.Material;
    readonly fascia: THREE.Material;
    readonly beltLine: THREE.Material;
    readonly foundation: THREE.Material;
    readonly skirtAO: THREE.Material;
    readonly floorDefault: THREE.Material;
    readonly floorTatami: THREE.Material;
    readonly floorTile: THREE.Material;
    readonly floorBalcony: THREE.Material;
    readonly glass: THREE.Material;
    readonly frame: THREE.Material;
    readonly door: THREE.Material;
    readonly doorInterior: THREE.Material;
    readonly doorSliding: THREE.Material;
    readonly doorHandle: THREE.Material;
    readonly stair: THREE.Material;
    readonly siteGround: THREE.Material;
    readonly boundaryLine: THREE.Material;
    readonly curb: THREE.Material;
    readonly paving: THREE.Material;
    readonly road: THREE.Material;
    readonly roadLine: THREE.Material;
    readonly parking: THREE.Material;
    readonly carportFrame: THREE.Material;
    readonly carportRoof: THREE.Material;
    readonly carBody: THREE.Material;
    readonly carGlass: THREE.Material;
    readonly carTire: THREE.Material;
    readonly carWheel: THREE.Material;
    readonly treeTrunk: THREE.Material;
    readonly treeFoliage: THREE.Material;
    readonly treeFoliageDark: THREE.Material;
    readonly shrub: THREE.Material;
    readonly fence: THREE.Material;
    readonly fixtureCounter: THREE.Material;
    readonly fixtureCeramic: THREE.Material;
    readonly fixtureFabric: THREE.Material;
    readonly fixtureWood: THREE.Material;
    readonly northArrow: THREE.Material;
    readonly trackGeometry: (geo: THREE.BufferGeometry) => void;
    readonly disposeAll: () => void;
};

export type BuildSceneResult = {
    readonly scene: THREE.Group;
    readonly bounds: SceneBounds;
    readonly sceneBounds: SceneBounds;
    readonly ldkCenter?: Point3D | undefined;
    readonly ldkFacing?: Point3D | undefined;
    readonly updateCameraAzimuth?:
        ((camPos: THREE.Vector3) => void) | undefined;
    readonly dispose: () => void;
};
