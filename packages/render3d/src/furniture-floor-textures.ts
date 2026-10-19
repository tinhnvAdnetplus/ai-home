import * as THREE from 'three';
import { type RoomType } from '@aihome/bdm';
import {
    makeEntranceCanvas,
    makeTatamiCanvas,
    makeTileCanvas,
    makeWoodCanvas,
} from './furniture-floor-canvas.js';
import { type MaterialRegistry } from './types.js';

const createdTextures: THREE.Texture[] = [];
const createdMaterials: THREE.Material[] = [];

function createTextureFromCanvas(
    canvas: HTMLCanvasElement,
): THREE.CanvasTexture {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    createdTextures.push(tex);
    return tex;
}

let cachedWood: THREE.MeshStandardMaterial | null = null;
let cachedTatami: THREE.MeshStandardMaterial | null = null;
let cachedTile: THREE.MeshStandardMaterial | null = null;
let cachedEntrance: THREE.MeshStandardMaterial | null = null;

export function getProceduralFloorMaterial(
    type: RoomType,
    reg: MaterialRegistry,
): THREE.Material {
    if (typeof document === 'undefined') {
        if (type === 'washitsu') return reg.floorTatami;
        if (type === 'entrance' || type === 'hall' || type === 'corridor') {
            return reg.curb;
        }
        if (
            type === 'bath' ||
            type === 'wash' ||
            type === 'toilet' ||
            type === 'laundry'
        ) {
            return reg.floorTile;
        }
        if (type === 'balcony' || type === 'porch' || type === 'deck')
            return reg.floorBalcony;
        return reg.floorDefault;
    }

    if (type === 'entrance' || type === 'hall' || type === 'corridor') {
        if (!cachedEntrance) {
            const tex = createTextureFromCanvas(makeEntranceCanvas());
            cachedEntrance = new THREE.MeshStandardMaterial({
                map: tex,
                roughness: 0.8,
                metalness: 0.02,
                side: THREE.DoubleSide,
            });
            createdMaterials.push(cachedEntrance);
        }
        return cachedEntrance;
    }

    if (type === 'washitsu') {
        if (!cachedTatami) {
            const tex = createTextureFromCanvas(makeTatamiCanvas());
            cachedTatami = new THREE.MeshStandardMaterial({
                map: tex,
                roughness: 0.85,
                side: THREE.DoubleSide,
            });
            createdMaterials.push(cachedTatami);
        }
        return cachedTatami;
    }

    if (
        type === 'bath' ||
        type === 'wash' ||
        type === 'toilet' ||
        type === 'laundry'
    ) {
        if (!cachedTile) {
            const tex = createTextureFromCanvas(makeTileCanvas());
            cachedTile = new THREE.MeshStandardMaterial({
                map: tex,
                roughness: 0.35,
                metalness: 0.05,
                side: THREE.DoubleSide,
            });
            createdMaterials.push(cachedTile);
        }
        return cachedTile;
    }

    if (type === 'balcony' || type === 'porch' || type === 'deck') {
        return reg.floorBalcony;
    }

    if (!cachedWood) {
        const tex = createTextureFromCanvas(makeWoodCanvas());
        cachedWood = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.45,
            metalness: 0.04,
            side: THREE.DoubleSide,
        });
        createdMaterials.push(cachedWood);
    }
    return cachedWood;
}

export function applyWorldUv(geo: THREE.BufferGeometry, scale = 1.2): void {
    const posAttr = geo.getAttribute('position');
    const uvAttr = geo.getAttribute('uv');
    if (
        posAttr instanceof THREE.BufferAttribute &&
        uvAttr instanceof THREE.BufferAttribute
    ) {
        for (let i = 0; i < posAttr.count; i += 1) {
            uvAttr.setXY(i, posAttr.getX(i) / scale, posAttr.getY(i) / scale);
        }
        uvAttr.needsUpdate = true;
    }
}

export function disposeFloorTextures(): void {
    for (const t of createdTextures) t.dispose();
    for (const m of createdMaterials) m.dispose();
    createdTextures.length = 0;
    createdMaterials.length = 0;
    cachedWood = null;
    cachedTatami = null;
    cachedTile = null;
    cachedEntrance = null;
}
